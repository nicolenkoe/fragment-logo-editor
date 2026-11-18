package com.nicolenkoe.hub;
import java.io.*;import java.security.*;import java.util.*;
/** Android-independent selection, persistent cache and integrity/identity checks. */
public final class UpdateEngine {
 private static final Object CACHE_LOCK=new Object();
 public static class Release {
  public final int code,minSdk,maxSdk;public final String name,channel,url,hash;public final long size;public final Set<String> abis;public final boolean withdrawn;
  public Release(int c,String n,String ch,String u,String h,long s,int min,int max,Set<String> a,boolean w){code=c;name=n;channel=ch;url=u;hash=h;size=s;minSdk=min;maxSdk=max;abis=a==null?Collections.<String>emptySet():a;withdrawn=w;}
  public String fileName(){return code+"-"+hash+".apk";}
 }
 public static class Identity {
  public final String packageName;public final int code,minSdk;public final Set<String> signers,abis;
  public Identity(String p,int c,int min,Set<String> s,Set<String> a){packageName=p;code=c;minSdk=min;signers=s;abis=a;}
 }
 public interface Source {InputStream open(String url)throws Exception;}
 public interface Inspector {Identity inspect(File file)throws Exception;}
 public interface Cancel {boolean cancelled();}
 public static class Prepared {public final File file;public final boolean reused;Prepared(File f,boolean r){file=f;reused=r;}}
 public static class Cancelled extends IOException {}
 public static boolean compatible(Set<String> required,Set<String> device){if(required==null||required.isEmpty())return true;for(String abi:required)if(device.contains(abi))return true;return false;}
 public static boolean descriptor(Release r,int sdk,Set<String> abis){return !r.withdrawn&&r.code>0&&r.size>0&&r.minSdk<=sdk&&(r.maxSdk<=0||sdk<=r.maxSdk)&&compatible(r.abis,abis)&&UpdatePolicy.trustedUrl(r.url)&&UpdatePolicy.validHash(r.hash);}
 public static Release latest(List<Release> releases,boolean stableOnly,int sdk,Set<String> abis){Release best=null;for(Release r:releases)if(descriptor(r,sdk,abis)&&UpdatePolicy.channelAllowed(r.channel,stableOnly)&&(best==null||r.code>best.code))best=r;return best;}
 public static String digest(File file)throws Exception{MessageDigest md=MessageDigest.getInstance("SHA-256");try(InputStream in=new FileInputStream(file)){byte[] b=new byte[16384];int n;while((n=in.read(b))!=-1)md.update(b,0,n);}StringBuilder out=new StringBuilder();for(byte b:md.digest())out.append(String.format(Locale.ROOT,"%02x",b&255));return out.toString();}
 public static void verify(File file,Release release,Inspector inspector,Identity installed,int sdk,Set<String> device)throws Exception{
  if(!descriptor(release,sdk,device))throw new IOException("Сборка несовместима с устройством");
  if(!file.isFile()||file.length()!=release.size)throw new IOException("Размер APK не совпадает");
  if(!digest(file).equals(release.hash))throw new IOException("Контрольная сумма APK не совпадает");
  Identity archive=inspector.inspect(file);
  if(archive==null||!installed.packageName.equals(archive.packageName))throw new IOException("Имя пакета APK не совпадает");
  if(archive.code!=release.code||archive.code<=installed.code)throw new IOException("Номер версии APK не подходит");
  if(archive.signers==null||archive.signers.isEmpty()||!archive.signers.equals(installed.signers))throw new IOException("Подпись APK отличается от установленного приложения");
  if(archive.minSdk>sdk||!compatible(archive.abis,device))throw new IOException("APK несовместим с устройством");
 }
 public static Prepared prepare(File dir,Release release,Source source,Inspector inspector,Identity installed,int sdk,Set<String> abis,Cancel cancel)throws Exception{
  synchronized(CACHE_LOCK){
   if(cancel.cancelled())throw new Cancelled();
   if(!dir.isDirectory()&&!dir.mkdirs())throw new IOException("Не удалось создать папку обновлений");
   File ready=new File(dir,release.fileName());
   if(ready.exists()){try{verify(ready,release,inspector,installed,sdk,abis);if(cancel.cancelled())throw new Cancelled();return new Prepared(ready,true);}catch(Cancelled e){throw e;}catch(Exception invalid){if(!ready.delete())throw new IOException("Не удалось заменить повреждённый APK");}}
   File temp=new File(dir,release.fileName()+".part");
   try{long count=0;try(InputStream in=source.open(release.url);OutputStream out=new FileOutputStream(temp)){byte[] b=new byte[16384];int n;while((n=in.read(b))!=-1){if(cancel.cancelled())throw new Cancelled();count+=n;if(count>release.size)throw new IOException("Размер APK превышает ожидаемый");out.write(b,0,n);}}
    if(cancel.cancelled())throw new Cancelled();verify(temp,release,inspector,installed,sdk,abis);
    if(!temp.renameTo(ready))throw new IOException("Не удалось сохранить проверенный APK");return new Prepared(ready,false);
   }finally{if(temp.exists())temp.delete();}
  }
 }
}

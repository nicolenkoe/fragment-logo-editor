package ru.fragment.logoeditor;
import java.io.*;
import java.security.MessageDigest;
/** No network or Android dependency: corrupt/incomplete files never become ready APKs. */
public final class UpdateCache {
 public interface Downloader {void download(File destination)throws Exception;}
 public interface Verifier {void verify(File apk)throws Exception;}
 public static String sha256(File f)throws Exception{MessageDigest md=MessageDigest.getInstance("SHA-256");InputStream in=new FileInputStream(f);try{byte[] b=new byte[65536];int n;while((n=in.read(b))!=-1)md.update(b,0,n);}finally{in.close();}return hex(md.digest());}
 public static String hex(byte[] data){StringBuilder s=new StringBuilder();for(byte b:data)s.append(String.format(java.util.Locale.US,"%02x",b&255));return s.toString();}
 public static void bytes(File f,long size,String sha)throws Exception{if(!f.isFile()||f.length()!=size)throw new IOException("Размер APK не совпадает со списком выпуска");if(!sha.equals(sha256(f)))throw new IOException("SHA-256 APK не совпадает со списком выпуска");}
 public static File obtain(File target,Downloader downloader,Verifier verifier)throws Exception{
  if(target.isFile()){try{verifier.verify(target);return target;}catch(Exception invalid){if(!target.delete())throw new IOException("Не удалось удалить повреждённый APK",invalid);}}
  File part=new File(target.getPath()+".part.apk");if(part.exists()){boolean valid=false;try{verifier.verify(part);valid=true;}catch(Exception invalid){}if(valid){if(!part.renameTo(target))throw new IOException("Не удалось восстановить проверенный APK");return target;}if(!part.delete())throw new IOException("Не удалось очистить неполную загрузку");}
  try{downloader.download(part);verifier.verify(part);if(!part.renameTo(target))throw new IOException("Не удалось сохранить проверенный APK");return target;}finally{if(part.exists())part.delete();}
 }
 private UpdateCache(){}
}

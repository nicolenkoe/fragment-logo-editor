package ru.fragment.logoeditor;
import java.io.*;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.zip.*;
import com.android.apksig.ApkVerifier;
import com.android.apksig.apk.ApkUtils;
/** Real APK cryptographic verification, also executed by host regression tests. */
public final class ApkIntegrity {
 public static Set<String> verify(File file,long size,String sha,Set<String> expectedSigners,int expectedMinSdk)throws Exception{
  UpdateCache.bytes(file,size,sha);
  ApkVerifier.Result result=new ApkVerifier.Builder(file).setMinCheckedPlatformVersion(23).setMaxCheckedPlatformVersion(35).build().verify();
  if(!result.isVerified())throw new IOException("Криптографическая подпись APK недействительна: "+result.getErrors());
  Set<String> actual=new HashSet<String>();for(X509Certificate c:result.getSignerCertificates())actual.add(UpdateCache.hex(MessageDigest.getInstance("SHA-256").digest(c.getEncoded())));
  if(actual.isEmpty()||!actual.equals(expectedSigners))throw new IOException("Подпись APK не совпадает с подписью выпуска");
  ZipFile zip=new ZipFile(file);try{ZipEntry entry=zip.getEntry("AndroidManifest.xml");if(entry==null||entry.getSize()>1048576)throw new IOException("Некорректный AndroidManifest.xml");InputStream in=zip.getInputStream(entry);ByteArrayOutputStream out=new ByteArrayOutputStream();try{byte[] b=new byte[4096];int n;while((n=in.read(b))!=-1){if(out.size()+n>1048576)throw new IOException("Некорректный AndroidManifest.xml");out.write(b,0,n);}}finally{in.close();}int min=ApkUtils.getMinSdkVersionFromBinaryAndroidManifest(ByteBuffer.wrap(out.toByteArray()));if(min!=expectedMinSdk)throw new IOException("Минимальная версия Android не совпадает с выпуском");}finally{zip.close();}
  return actual;
 }
 private ApkIntegrity(){}
}

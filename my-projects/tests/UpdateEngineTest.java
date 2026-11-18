import com.nicolenkoe.hub.*;import java.io.*;import java.nio.file.*;import java.security.*;import java.util.*;
public class UpdateEngineTest {
 static int assertions=0;static final Set<String> DEVICE=new HashSet<>(Arrays.asList("arm64-v8a","armeabi-v7a"));static final Set<String> SIGN=new HashSet<>(Arrays.asList("same-signing-certificate"));static final byte[] DATA="verified update fixture".getBytes();
 static void ok(boolean v,String reason){assertions++;if(!v)throw new AssertionError(reason);}
 static UpdateEngine.Identity installed=new UpdateEngine.Identity("com.nicolenkoe.hub",7,26,SIGN,Collections.emptySet());
 static UpdateEngine.Identity identity(int code){return new UpdateEngine.Identity("com.nicolenkoe.hub",code,26,SIGN,Collections.emptySet());}
 static String hash(byte[] data)throws Exception{MessageDigest md=MessageDigest.getInstance("SHA-256");StringBuilder out=new StringBuilder();for(byte b:md.digest(data))out.append(String.format("%02x",b&255));return out.toString();}
 static UpdateEngine.Release r(int code,String channel,int min,int max,Set<String> abis,boolean withdrawn)throws Exception{return new UpdateEngine.Release(code,"1."+code,channel,"https://nicolenkoe.github.io/fragment-logo-editor/my-projects/my-projects-1."+code+".apk",hash(DATA),DATA.length,min,max,abis,withdrawn);}
 static UpdateEngine.Release release(int code,String channel)throws Exception{return r(code,channel,26,0,Collections.emptySet(),false);}
 interface Action{void run()throws Exception;}
 static void rejects(Action action,String reason)throws Exception{try{action.run();}catch(Exception expected){ok(true,reason);return;}throw new AssertionError(reason);}
 public static void main(String[] args)throws Exception{
  UpdateEngine.Release stable=release(8,"stable"),test=release(9,"testing"),exp=release(10,"experimental"),future=r(11,"testing",99,0,null,false),withdrawn=r(12,"stable",26,0,null,true),wrongAbi=r(13,"experimental",26,0,new HashSet<>(Arrays.asList("x86_64")),false);
  List<UpdateEngine.Release> all=Arrays.asList(test,withdrawn,stable,future,exp,wrongAbi);
  ok(UpdateEngine.latest(all,false,35,DEVICE)==exp,"Default selects newest compatible experimental build");
  ok(UpdateEngine.latest(all,true,35,DEVICE)==stable,"Stable-only selects stable behind newer testing/experimental");
  ok(UpdateEngine.latest(Arrays.asList(test,exp),true,35,DEVICE)==null,"No stable releases is explicit empty selection");
  ok(UpdateEngine.latest(Arrays.asList(test),false,35,DEVICE)==test,"Testing alone is allowed by default");
  ok(UpdateEngine.latest(Arrays.asList(r(20,"stable",26,30,null,false),stable),true,35,DEVICE)==stable,"maxSdk compatibility");
  ok(UpdateEngine.latest(Arrays.asList(r(20,"unknown",26,0,null,false),stable),false,35,DEVICE)==stable,"Unknown channels not installed");
  File dir=Files.createTempDirectory("update-cache-").toFile();int[] calls={0};UpdateEngine.Source source=url->{calls[0]++;return new ByteArrayInputStream(DATA);};UpdateEngine.Inspector inspector=file->identity(10);
  UpdateEngine.Prepared first=UpdateEngine.prepare(dir,exp,source,inspector,installed,35,DEVICE,()->false);ok(!first.reused&&calls[0]==1,"First visit automatically downloads once");
  UpdateEngine.Prepared second=UpdateEngine.prepare(dir,exp,source,inspector,installed,35,DEVICE,()->false);ok(second.reused&&calls[0]==1,"Revisit/Later reuse after full validation without HTTP APK request");
  UpdateEngine.Prepared restarted=UpdateEngine.prepare(new File(dir.getAbsolutePath()),exp,source,inspector,installed,35,DEVICE,()->false);ok(restarted.reused&&calls[0]==1,"Persisted cache reused with new File/client after restart");
  UpdateEngine.Release newer=release(14,"testing");UpdateEngine.prepare(dir,newer,source,file->identity(14),installed,35,DEVICE,()->false);ok(calls[0]==2,"Later on an older build does not block new allowed download");
  Files.write(first.file.toPath(),new byte[DATA.length]);UpdateEngine.prepare(dir,exp,source,inspector,installed,35,DEVICE,()->false);ok(calls[0]==3,"Same-size SHA corruption is redownloaded");
  Files.write(first.file.toPath(),new byte[1]);UpdateEngine.prepare(dir,exp,source,inspector,installed,35,DEVICE,()->false);ok(calls[0]==4,"Truncated cache is redownloaded");
  rejects(()->UpdateEngine.verify(first.file,exp,f->new UpdateEngine.Identity("wrong.package",10,26,SIGN,Collections.emptySet()),installed,35,DEVICE),"Reject wrong package");
  rejects(()->UpdateEngine.verify(first.file,exp,f->identity(9),installed,35,DEVICE),"Reject version different from feed");
  rejects(()->UpdateEngine.verify(first.file,exp,f->new UpdateEngine.Identity("com.nicolenkoe.hub",10,26,new HashSet<>(Arrays.asList("other-signer")),Collections.emptySet()),installed,35,DEVICE),"Reject different signer");
  rejects(()->UpdateEngine.verify(first.file,exp,f->new UpdateEngine.Identity("com.nicolenkoe.hub",10,99,SIGN,Collections.emptySet()),installed,35,DEVICE),"Verify actual APK minSdk");
  rejects(()->UpdateEngine.verify(first.file,exp,f->new UpdateEngine.Identity("com.nicolenkoe.hub",10,26,SIGN,new HashSet<>(Arrays.asList("x86_64"))),installed,35,DEVICE),"Verify actual APK ABI");
  rejects(()->UpdateEngine.verify(first.file,exp,inspector,identity(10),35,DEVICE),"Never install equal/older version");
  File bad=Files.createTempDirectory("bad-download-").toFile();rejects(()->UpdateEngine.prepare(bad,exp,url->new ByteArrayInputStream(new byte[1]),inspector,installed,35,DEVICE,()->false),"Reject short network file");ok(!new File(bad,exp.fileName()).exists(),"Invalid download never becomes ready");
  rejects(()->UpdateEngine.prepare(bad,exp,url->new ByteArrayInputStream(new byte[DATA.length+1]),inspector,installed,35,DEVICE,()->false),"Reject oversized download");
  rejects(()->UpdateEngine.prepare(bad,exp,url->new ByteArrayInputStream(new byte[DATA.length]),inspector,installed,35,DEVICE,()->false),"Reject wrong downloaded SHA");
  rejects(()->UpdateEngine.prepare(bad,exp,source,inspector,installed,35,DEVICE,()->true),"Policy changes cancel outdated work");
  ok(!UpdatePolicy.trustedUrl("https://evil.example/my-projects-1.9.apk"),"Reject other origin");ok(!UpdatePolicy.trustedUrl("http://nicolenkoe.github.io/fragment-logo-editor/my-projects/my-projects-1.9.apk"),"Require HTTPS");
  ok(UpdatePolicy.trustedThreadUrl("https://chatgpt.com/local/6afbc15c-b5ac-8191-b689-765abe957078"),"Existing Codex link support unchanged");
  System.out.println("PASS "+assertions+" assertions: all/stable selection, compatibility, cache/restart/Later/new release, size/hash/package/version/signer checks, cancellation and unchanged thread validation");
 }
}

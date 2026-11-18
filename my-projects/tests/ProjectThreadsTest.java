import com.nicolenkoe.hub.ProjectThreads;
public class ProjectThreadsTest {
 public static void main(String[] args){String[][] expected={
 {"my-projects","https://chatgpt.com/local/6afbc15c-b5ac-8191-b689-765abe957078"},
 {"CamaraD-downloads","https://chatgpt.com/local/01a1a8f2-2e0b-7478-8848-32a86deaf053"},
 {"enduro-club-downloads","https://chatgpt.com/local/01a1b372-1c96-72c5-81d3-8ce34306c06e"},
 {"fragment-logo-editor","https://chatgpt.com/local/6afb68f0-bfcc-8191-b002-84123846707f"},
 {"screen-recorder-downloads","https://chatgpt.com/local/6afb6be8-b9f0-8191-be20-accb13c6a04c"},
 {"hvost-pod-kontrolem-downloads","https://chatgpt.com/local/6af50efb-cc3c-8191-a02e-302d0b3ea049"}};
 for(String[] item:expected)if(!ProjectThreads.url(item[0]).equals(item[1]))throw new AssertionError(item[0]);
 if(!ProjectThreads.url("CAMARAD-DOWNLOADS").equals(ProjectThreads.url("CamaraD_App")))throw new AssertionError("Case/alias");
 if(!ProjectThreads.url("enduro_moto").equals(ProjectThreads.url("enduro-club-downloads")))throw new AssertionError("Enduro alias");
 if(ProjectThreads.url("hvost-pod-kontrolem").equals(ProjectThreads.url("enduro_moto")))throw new AssertionError("Hvost/Enduro must differ");
 System.out.println("PASS: six exact supplied thread URLs, aliases/case handling, distinct Hvost/Enduro");
 }
}

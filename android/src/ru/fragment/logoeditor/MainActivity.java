package ru.fragment.logoeditor;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.util.Base64;
import android.webkit.*;
import android.widget.Toast;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.net.HttpURLConnection;
import org.json.JSONObject;

/** Offline editor; documents are selected and saved through Android's file picker. */
public class MainActivity extends Activity {
 private WebView web;
 private ValueCallback<Uri[]> chooser;
 private byte[] pendingFile;
 private static final int OPEN_FILE=100,SAVE_FILE=101;
 @Override public void onCreate(Bundle state){
  super.onCreate(state);getWindow().setStatusBarColor(Color.rgb(250,251,247));getWindow().setNavigationBarColor(Color.rgb(238,239,235));
  int flags=android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;if(android.os.Build.VERSION.SDK_INT>=26)flags|=android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;getWindow().getDecorView().setSystemUiVisibility(flags);
  web=new WebView(this);setContentView(web);WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(true);settings.setAllowContentAccess(true);settings.setMediaPlaybackRequiresUserGesture(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.addJavascriptInterface(new FileBridge(),"AndroidFiles");web.addJavascriptInterface(new UpdateBridge(),"AndroidUpdates");
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return external(request.getUrl());}
   @Override public boolean shouldOverrideUrlLoading(WebView view,String url){return external(Uri.parse(url));}
   private boolean external(Uri uri){if("file".equals(uri.getScheme())||"about".equals(uri.getScheme()))return false;try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception ignored){Toast.makeText(MainActivity.this,"Не удалось открыть ссылку",Toast.LENGTH_SHORT).show();}return true;}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
    if(chooser!=null)chooser.onReceiveValue(null);chooser=callback;
    try{Intent intent=params.createIntent();intent.addCategory(Intent.CATEGORY_OPENABLE);intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);startActivityForResult(intent,OPEN_FILE);return true;}
    catch(Exception error){chooser=null;return false;}
   }
  });
  if(state!=null)web.restoreState(state);else web.loadUrl("file:///android_asset/www/editor.html");
 }
 public class UpdateBridge {
  private volatile boolean checking=false;
  @JavascriptInterface public String getVersion(){try{android.content.pm.PackageInfo p=getPackageManager().getPackageInfo(getPackageName(),0);return new JSONObject().put("version",p.versionName).put("versionCode",p.versionCode).toString();}catch(Exception e){return "{}";}}
  @JavascriptInterface public synchronized void check(){if(checking)return;checking=true;new Thread(new Runnable(){public void run(){HttpURLConnection connection=null;String response;
   try{connection=(HttpURLConnection)new URL("https://raw.githubusercontent.com/nicolenkoe/fragment-logo-editor/gh-pages/versions.json?check="+System.currentTimeMillis()).openConnection();connection.setConnectTimeout(8000);connection.setReadTimeout(8000);connection.setInstanceFollowRedirects(false);connection.setUseCaches(false);if(connection.getResponseCode()!=200)throw new java.io.IOException();InputStream in=connection.getInputStream();ByteArrayOutputStream out=new ByteArrayOutputStream();try{byte[] buffer=new byte[4096];int n;while((n=in.read(buffer))!=-1){if(out.size()+n>1048576)throw new java.io.IOException();out.write(buffer,0,n);}}finally{in.close();}response=new String(out.toByteArray(),"UTF-8");new JSONObject(response);
   }catch(Exception error){response="{\"error\":\"Не удалось проверить GitHub. Проверьте интернет и попробуйте позже.\"}";}finally{if(connection!=null)connection.disconnect();checking=false;}
   final String json=response;runOnUiThread(new Runnable(){public void run(){if(!isFinishing()&&!isDestroyed())web.evaluateJavascript("window.fragmentUpdateResult&&window.fragmentUpdateResult(JSON.parse("+JSONObject.quote(json)+"))",null);}});
  }}).start();}
  @JavascriptInterface public void openDownload(final String value){try{final Uri uri=Uri.parse(value);if(!"https".equals(uri.getScheme())||!"raw.githubusercontent.com".equals(uri.getHost())||uri.getUserInfo()!=null||!uri.getPath().matches("/nicolenkoe/fragment-logo-editor/(gh-pages|[a-f0-9]{7,40})/downloads/[a-zA-Z0-9_./-]+\\.apk")||uri.getPath().contains(".."))return;runOnUiThread(new Runnable(){public void run(){try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception e){Toast.makeText(MainActivity.this,"Не удалось открыть скачивание",Toast.LENGTH_LONG).show();}}});}catch(Exception ignored){}}
 }
 public class FileBridge {
  @JavascriptInterface public void saveBase64(final String name,final String data,final String mime){
   new Thread(new Runnable(){public void run(){try{final byte[] bytes=Base64.decode(data,Base64.DEFAULT);runOnUiThread(new Runnable(){public void run(){pendingFile=bytes;Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType(mime==null||mime.isEmpty()?"application/octet-stream":mime);intent.putExtra(Intent.EXTRA_TITLE,name);try{startActivityForResult(intent,SAVE_FILE);}catch(Exception error){pendingFile=null;Toast.makeText(MainActivity.this,"Не удалось открыть сохранение файла",Toast.LENGTH_LONG).show();}}});}catch(Exception error){runOnUiThread(new Runnable(){public void run(){Toast.makeText(MainActivity.this,"Не удалось подготовить файл",Toast.LENGTH_LONG).show();}});}}}).start();
  }
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);
  if(request==OPEN_FILE&&chooser!=null){chooser.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));chooser=null;}
  if(request==SAVE_FILE){final byte[] bytes=pendingFile;pendingFile=null;if(result==RESULT_OK&&data!=null&&data.getData()!=null&&bytes!=null){final Uri uri=data.getData();new Thread(new Runnable(){public void run(){try{OutputStream output=getContentResolver().openOutputStream(uri);if(output==null)throw new java.io.IOException();try{output.write(bytes);}finally{output.close();}runOnUiThread(new Runnable(){public void run(){Toast.makeText(MainActivity.this,"Файл сохранён",Toast.LENGTH_SHORT).show();}});}catch(Exception error){runOnUiThread(new Runnable(){public void run(){Toast.makeText(MainActivity.this,"Не удалось сохранить файл",Toast.LENGTH_LONG).show();}});}}}).start();}}
 }
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onSaveInstanceState(Bundle state){web.saveState(state);super.onSaveInstanceState(state);}
 @Override protected void onDestroy(){if(chooser!=null)chooser.onReceiveValue(null);web.removeJavascriptInterface("AndroidFiles");web.removeJavascriptInterface("AndroidUpdates");web.destroy();super.onDestroy();}
}

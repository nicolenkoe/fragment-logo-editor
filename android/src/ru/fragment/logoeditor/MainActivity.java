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
 private boolean viewportDrawPending;private long viewportDrawGeneration;
 private android.view.View rotationCover;private volatile android.graphics.Bitmap rotationPreview;
 private final java.util.concurrent.ExecutorService previewDecoder=java.util.concurrent.Executors.newSingleThreadExecutor();
 private volatile long previewGeneration;
 private float previewLeft=.08f,previewTop=.2f,previewRight=.92f,previewBottom=.9f;
 public class ViewportBridge {
  @JavascriptInterface public void preview(final String data){
   if(data==null||!data.startsWith("data:image/png;base64,")||data.length()>8000000)return;
   final long generation=++previewGeneration;
   previewDecoder.execute(new Runnable(){public void run(){try{byte[] bytes=Base64.decode(data.substring(22),Base64.DEFAULT);final android.graphics.Bitmap image=android.graphics.BitmapFactory.decodeByteArray(bytes,0,bytes.length);
    if(image!=null&&generation==previewGeneration)runOnUiThread(new Runnable(){public void run(){rotationPreview=image;if(viewportDrawPending&&rotationCover!=null)rotationCover.invalidate();}});
   }catch(Exception ignored){}}});
  }
 }
 private void viewportReady(final long generation){
  web.evaluateJavascript("JSON.stringify((()=>{window.FragmentViewport&&window.FragmentViewport.resize();const c=document.getElementById('canvas');if(!c)return null;const r=c.getBoundingClientRect();return [r.left/innerWidth,r.top/innerHeight,r.right/innerWidth,r.bottom/innerHeight]})())",new ValueCallback<String>(){public void onReceiveValue(String value){
   try{org.json.JSONArray a=new org.json.JSONArray((String)new org.json.JSONTokener(value).nextValue());if(generation==viewportDrawGeneration){previewLeft=(float)a.getDouble(0);previewTop=(float)a.getDouble(1);previewRight=(float)a.getDouble(2);previewBottom=(float)a.getDouble(3);rotationCover.invalidate();}}catch(Exception ignored){}
   web.postVisualStateCallback(generation,new WebView.VisualStateCallback(){public void onComplete(long id){if(id==viewportDrawGeneration){viewportDrawPending=false;web.invalidate();rotationCover.invalidate();}}});
  }});
 }
 private ValueCallback<Uri[]> chooser;
 private byte[] pendingFile;
 private UpdateManager updates;private java.io.File installAfterPermission;
 private static final int OPEN_FILE=100,SAVE_FILE=101;
 @Override public void onCreate(Bundle state){
  super.onCreate(state);getWindow().setStatusBarColor(Color.rgb(250,251,247));getWindow().setNavigationBarColor(Color.rgb(238,239,235));
  int flags=android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;if(android.os.Build.VERSION.SDK_INT>=26)flags|=android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;getWindow().getDecorView().setSystemUiVisibility(flags);
  web=new WebView(this){
   @Override protected void onSizeChanged(int w,int h,int oldw,int oldh){
    super.onSizeChanged(w,h,oldw,oldh);
    if(w<=0||h<=0||(w==oldw&&h==oldh))return;
    final long generation=++viewportDrawGeneration;
    viewportDrawPending=oldw>0&&oldh>0&&w!=oldw;
    if(viewportDrawPending){previewLeft=.04f;previewTop=.04f;previewRight=.96f;previewBottom=.96f;if(rotationCover!=null)rotationCover.invalidate();}
    post(new Runnable(){public void run(){if(!isFinishing()&&!isDestroyed())viewportReady(generation);}});
    postDelayed(new Runnable(){public void run(){if(generation==viewportDrawGeneration&&viewportDrawPending){viewportDrawPending=false;invalidate();if(rotationCover!=null)rotationCover.invalidate();}}},2500);
   }
  };
  android.widget.FrameLayout root=new android.widget.FrameLayout(this);
  root.addView(web,new android.widget.FrameLayout.LayoutParams(-1,-1));
  rotationCover=new android.view.View(this){private final android.graphics.Paint paint=new android.graphics.Paint(3);@Override protected void onDraw(android.graphics.Canvas c){
   if(!viewportDrawPending)return;c.drawColor(Color.rgb(225,228,220));android.graphics.Bitmap image=rotationPreview;if(image==null)return;
   float left=Math.max(0,previewLeft*getWidth()),top=Math.max(0,previewTop*getHeight()),right=Math.min(getWidth(),previewRight*getWidth()),bottom=Math.min(getHeight(),previewBottom*getHeight());
   float fit=Math.min((right-left)/image.getWidth(),(bottom-top)/image.getHeight()),w=image.getWidth()*fit,h=image.getHeight()*fit;
   android.graphics.RectF target=new android.graphics.RectF((left+right-w)/2,(top+bottom-h)/2,(left+right+w)/2,(top+bottom+h)/2);c.drawBitmap(image,null,target,paint);
  }};
  rotationCover.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO);rotationCover.setClickable(false);root.addView(rotationCover,new android.widget.FrameLayout.LayoutParams(-1,-1));setContentView(root);
  previewDecoder.execute(new Runnable(){public void run(){try{InputStream in=getAssets().open("www/assets/enduro-logo.png");try{android.graphics.Bitmap image=android.graphics.BitmapFactory.decodeStream(in);if(rotationPreview==null)rotationPreview=image;}finally{in.close();}}catch(Exception ignored){}}});
  WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(true);settings.setAllowContentAccess(true);settings.setMediaPlaybackRequiresUserGesture(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  updates=new UpdateManager(this,new UpdateManager.Host(){public void state(final JSONObject value){runOnUiThread(new Runnable(){public void run(){if(!isFinishing()&&!isDestroyed())web.evaluateJavascript("window.fragmentNativeUpdate&&window.fragmentNativeUpdate("+value.toString()+")",null);}});}public void install(final java.io.File file){runOnUiThread(new Runnable(){public void run(){if(!isFinishing()&&!isDestroyed())launchUpdateInstall(file);}});}});
  web.addJavascriptInterface(new ViewportBridge(),"AndroidViewport");web.addJavascriptInterface(new FileBridge(),"AndroidFiles");web.addJavascriptInterface(new UpdateBridge(),"AndroidUpdates");
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return external(request.getUrl());}
   @Override public boolean shouldOverrideUrlLoading(WebView view,String url){return external(Uri.parse(url));}
   private boolean external(Uri uri){if("file".equals(uri.getScheme())||"about".equals(uri.getScheme()))return false;try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception ignored){Toast.makeText(MainActivity.this,"Не удалось открыть ссылку",Toast.LENGTH_SHORT).show();}return true;}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
    if(chooser!=null)chooser.onReceiveValue(null);chooser=callback;
    try{Intent intent=params.createIntent();intent.addCategory(Intent.CATEGORY_OPENABLE);intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);startActivityForResult(intent,OPEN_FILE);return true;}
    catch(Exception error){chooser=null;android.util.Log.w("Fragment","Cannot open file chooser",error);Toast.makeText(MainActivity.this,"Не удалось открыть выбор файла",Toast.LENGTH_SHORT).show();return false;}
   }
  });
  if(state!=null)web.restoreState(state);else web.loadUrl("file:///android_asset/www/editor.html");
 }
 public class UpdateBridge {
  @JavascriptInterface public String getVersion(){return updates.settings();}
  @JavascriptInterface public String getSettings(){return updates.settings();}
  @JavascriptInterface public String getState(){return updates.snapshot();}
  @JavascriptInterface public void check(boolean manual){updates.check(manual);}
  @JavascriptInterface public void setStableOnly(boolean value){updates.setStableOnly(value);}
  @JavascriptInterface public void later(){updates.later();}
  @JavascriptInterface public void install(){updates.install();}
 }
 private void launchUpdateInstall(java.io.File file){
  if(android.os.Build.VERSION.SDK_INT>=26&&!getPackageManager().canRequestPackageInstalls()){installAfterPermission=file;try{startActivityForResult(new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,Uri.parse("package:"+getPackageName())),102);}catch(Exception e){updates.installerFinished();Toast.makeText(this,"Разрешите установку обновлений в настройках Android",Toast.LENGTH_LONG).show();}return;}
  Uri uri=Uri.parse("content://"+getPackageName()+".updates/"+file.getName());Intent intent=new Intent(Intent.ACTION_INSTALL_PACKAGE);intent.setDataAndType(uri,"application/vnd.android.package-archive");intent.setClipData(android.content.ClipData.newRawUri("APK",uri));intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);try{startActivityForResult(intent,103);}catch(Exception e){updates.installerFinished();Toast.makeText(this,"Не удалось открыть установщик Android",Toast.LENGTH_LONG).show();}
 }
 @Override public void onConfigurationChanged(android.content.res.Configuration configuration){
  super.onConfigurationChanged(configuration);if(web!=null){web.requestLayout();web.invalidate();}
 }
 @Override protected void onResume(){super.onResume();if(updates!=null)updates.check(false);}
 public class FileBridge {
  @JavascriptInterface public String imageAsset(String input){
   String path=ImageAssets.path(input);if(path==null)return null;
   try{InputStream in=getAssets().open(path);ByteArrayOutputStream out=new ByteArrayOutputStream();try{byte[] buffer=new byte[16384];int count;while((count=in.read(buffer))!=-1){if(out.size()+count>30*1024*1024)return null;out.write(buffer,0,count);}}finally{in.close();}
    return "data:"+ImageAssets.mime(path)+";base64,"+Base64.encodeToString(out.toByteArray(),Base64.NO_WRAP);
   }catch(Exception error){android.util.Log.w("Fragment","Cannot load packaged image",error);return null;}
  }

  @JavascriptInterface public void saveBase64(final String name,final String data,final String mime){
   new Thread(new Runnable(){public void run(){try{final byte[] bytes=Base64.decode(data,Base64.DEFAULT);runOnUiThread(new Runnable(){public void run(){pendingFile=bytes;Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType(mime==null||mime.isEmpty()?"application/octet-stream":mime);intent.putExtra(Intent.EXTRA_TITLE,name);try{startActivityForResult(intent,SAVE_FILE);}catch(Exception error){pendingFile=null;Toast.makeText(MainActivity.this,"Не удалось открыть сохранение файла",Toast.LENGTH_LONG).show();}}});}catch(Exception error){runOnUiThread(new Runnable(){public void run(){Toast.makeText(MainActivity.this,"Не удалось подготовить файл",Toast.LENGTH_LONG).show();}});}}}).start();
  }
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);
  if(request==102){java.io.File f=installAfterPermission;installAfterPermission=null;if(android.os.Build.VERSION.SDK_INT>=26&&getPackageManager().canRequestPackageInstalls()&&f!=null)updates.install();else{updates.installerFinished();Toast.makeText(this,"APK сохранён. Установку можно разрешить позже.",Toast.LENGTH_LONG).show();}return;}
  if(request==103){updates.installerFinished();return;}
  if(request==OPEN_FILE&&chooser!=null){chooser.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));chooser=null;}
  if(request==SAVE_FILE){final byte[] bytes=pendingFile;pendingFile=null;if(result==RESULT_OK&&data!=null&&data.getData()!=null&&bytes!=null){final Uri uri=data.getData();new Thread(new Runnable(){public void run(){try{OutputStream output=getContentResolver().openOutputStream(uri);if(output==null)throw new java.io.IOException();try{output.write(bytes);}finally{output.close();}runOnUiThread(new Runnable(){public void run(){Toast.makeText(MainActivity.this,"Файл сохранён",Toast.LENGTH_SHORT).show();}});}catch(Exception error){runOnUiThread(new Runnable(){public void run(){Toast.makeText(MainActivity.this,"Не удалось сохранить файл",Toast.LENGTH_LONG).show();}});}}}).start();}}
 }
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onSaveInstanceState(Bundle state){web.saveState(state);super.onSaveInstanceState(state);}
 @Override protected void onDestroy(){if(chooser!=null)chooser.onReceiveValue(null);previewDecoder.shutdownNow();web.removeJavascriptInterface("AndroidViewport");web.removeJavascriptInterface("AndroidFiles");web.removeJavascriptInterface("AndroidUpdates");web.destroy();super.onDestroy();}
}

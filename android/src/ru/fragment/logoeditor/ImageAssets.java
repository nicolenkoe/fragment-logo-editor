package ru.fragment.logoeditor;
/** Only packaged image resources may be exposed to the local image loader. */
final class ImageAssets {
 static String path(String input){
  if(input==null||input.indexOf('\0')>=0||input.indexOf('\\')>=0)return null;
  if(input.startsWith("file:///android_asset/www/"))input=input.substring("file:///android_asset/www/".length());
  if(!input.startsWith("assets/")||input.indexOf('%')>=0||input.indexOf('?')>=0||input.indexOf('#')>=0)return null;
  for(String piece:input.split("/",-1))if(piece.isEmpty()||piece.equals(".")||piece.equals(".."))return null;
  String mime=mime(input);return mime==null?null:"www/"+input;
 }
 static String mime(String path){String p=path.toLowerCase(java.util.Locale.ROOT);if(p.endsWith(".png"))return "image/png";if(p.endsWith(".jpg")||p.endsWith(".jpeg"))return "image/jpeg";if(p.endsWith(".webp"))return "image/webp";if(p.endsWith(".gif"))return "image/gif";if(p.endsWith(".svg"))return "image/svg+xml";return null;}
}

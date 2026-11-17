package com.nicolenkoe.hub;
/** The shared release selection rules. No Android dependencies. */
public final class UpdatePolicy {
 public static boolean eligible(int installed,int candidate,String channel,boolean testing,boolean withdrawn){
  return !withdrawn&&candidate>installed&&("stable".equals(channel)||(testing&&"testing".equals(channel)));
 }
 public static boolean trustedUrl(String value){
  try{java.net.URI u=new java.net.URI(value);return "https".equals(u.getScheme())&&"nicolenkoe.github.io".equals(u.getHost())&&u.getPort()==-1&&u.getRawUserInfo()==null&&u.getRawQuery()==null&&u.getRawFragment()==null&&u.getRawPath().matches("/fragment-logo-editor/my-projects/my-projects-[0-9]+(?:\\.[0-9]+)*\\.apk");}catch(Exception e){return false;}
 }
 public static boolean trustedThreadUrl(String value){try{java.net.URI u=new java.net.URI(value);String path=u.getRawPath();return "https".equals(u.getScheme())&&"chatgpt.com".equals(u.getHost())&&u.getPort()==-1&&u.getRawUserInfo()==null&&path!=null&&(path.startsWith("/local/")||path.startsWith("/c/")||path.startsWith("/codex/")||path.startsWith("/g/"));}catch(Exception e){return false;}}
 public static boolean validHash(String hash){return hash!=null&&hash.matches("[a-f0-9]{64}");}
}

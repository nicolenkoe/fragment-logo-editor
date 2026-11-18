package ru.fragment.logoeditor;
import java.net.URI;
import java.util.List;
/** Platform-independent selection rules shared by updater tests. */
public final class UpdatePolicy {
 public static final class Release {
  public String version,channel,publishedAt,apk,verification,packageName;
  public int code,minSdk;public String[] abis;
 }
 public static boolean allowed(Release r,boolean stableOnly){return !stableOnly||"stable".equals(r.channel);}
 public static boolean compatible(Release r,int sdk,String[] abis,String packageName){if(r.minSdk>sdk||!packageName.equals(r.packageName))return false;for(String a:r.abis){if("universal".equals(a))return true;for(String b:abis)if(a.equals(b))return true;}return false;}
 public static Release choose(List<Release> releases,boolean stableOnly,int sdk,String[] abis,String packageName,int installed){Release best=null;for(Release r:releases){if(!allowed(r,stableOnly)||!compatible(r,sdk,abis,packageName)||r.code<=installed)continue;if(best==null||r.publishedAt.compareTo(best.publishedAt)>0||r.publishedAt.equals(best.publishedAt)&&r.code>best.code)best=r;}return best;}
 public static boolean hasStable(List<Release> releases){for(Release r:releases)if("stable".equals(r.channel))return true;return false;}
 public static boolean trusted(String value,String extension){try{URI u=new URI(value);return "https".equals(u.getScheme())&&"raw.githubusercontent.com".equals(u.getHost())&&u.getUserInfo()==null&&u.getPort()==-1&&u.getQuery()==null&&u.getFragment()==null&&!u.getPath().contains("..")&&u.getPath().matches("/nicolenkoe/fragment-logo-editor/(gh-pages|[a-f0-9]{7,40})/downloads/[a-zA-Z0-9_./-]+")&&u.getPath().endsWith(extension);}catch(Exception e){return false;}}
 public static boolean identity(Release r,String packageName,int code,String version){return r.packageName.equals(packageName)&&r.code==code&&r.version.equals(version);}
 public static boolean shouldPrompt(int code,int deferred,long until,long now,boolean manual,boolean installing){return !installing&&(manual||code!=deferred||until<now);}
 private UpdatePolicy(){}
}

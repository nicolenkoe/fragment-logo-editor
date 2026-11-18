package com.nicolenkoe.hub;
/** Built-in confirmed links; remotely refreshed after startup. */
public final class ProjectThreads {
 public static final String INITIAL_PROJECTS_JSON="[{\"name\": \"CamaraD-downloads\", \"site\": \"https://nicolenkoe.github.io/CamaraD-downloads/\", \"private\": false, \"html_url\": \"https://github.com/nicolenkoe/CamaraD-downloads\"}, {\"name\": \"enduro-club-downloads\", \"site\": \"https://nicolenkoe.github.io/enduro-club-downloads/\", \"private\": false, \"html_url\": \"https://github.com/nicolenkoe/enduro-club-downloads\"}, {\"name\": \"fragment-logo-editor\", \"site\": \"https://nicolenkoe.github.io/fragment-logo-editor/\", \"private\": false, \"html_url\": \"https://github.com/nicolenkoe/fragment-logo-editor\"}, {\"name\": \"hvost-pod-kontrolem-downloads\", \"site\": \"https://nicolenkoe.github.io/hvost-pod-kontrolem-downloads/\", \"private\": false, \"html_url\": \"https://github.com/nicolenkoe/hvost-pod-kontrolem-downloads\"}, {\"name\": \"screen-recorder-downloads\", \"site\": \"https://nicolenkoe.github.io/screen-recorder-downloads/\", \"private\": false, \"html_url\": \"https://github.com/nicolenkoe/screen-recorder-downloads\"}, {\"name\": \"my-projects\", \"site\": \"https://nicolenkoe.github.io/fragment-logo-editor/my-projects/\", \"private\": false, \"html_url\": \"https://github.com/nicolenkoe/fragment-logo-editor/tree/gh-pages/my-projects\"}]";
 public static final java.util.Map<String,String> DEFAULTS;
 static{java.util.Map<String,String> links=new java.util.LinkedHashMap<>();
  links.put("my-projects","https://chatgpt.com/local/6afbc15c-b5ac-8191-b689-765abe957078");
  links.put("camarad-downloads","https://chatgpt.com/local/01a1a8f2-2e0b-7478-8848-32a86deaf053");
  links.put("camarad_app","https://chatgpt.com/local/01a1a8f2-2e0b-7478-8848-32a86deaf053");
  links.put("hvost-pod-kontrolem","https://chatgpt.com/local/6af50efb-cc3c-8191-a02e-302d0b3ea049");
  links.put("hvost-pod-kontrolem-downloads","https://chatgpt.com/local/6af50efb-cc3c-8191-a02e-302d0b3ea049");
  links.put("enduro-club-downloads","https://chatgpt.com/local/01a1b372-1c96-72c5-81d3-8ce34306c06e");
  links.put("enduro_moto","https://chatgpt.com/local/01a1b372-1c96-72c5-81d3-8ce34306c06e");
  links.put("fragment-logo-editor","https://chatgpt.com/local/6afb68f0-bfcc-8191-b002-84123846707f");
  links.put("screen-recorder-downloads","https://chatgpt.com/local/6afb6be8-b9f0-8191-be20-accb13c6a04c");
  DEFAULTS=java.util.Collections.unmodifiableMap(links);
 }
 public static String url(String name){String value=DEFAULTS.get(name.toLowerCase(java.util.Locale.ROOT));return value==null?"":value;}
}

package com.nicolenkoe.hub;
public final class NativeApps {
 public static String packageFor(String name){if(name==null)return "";switch(name.toLowerCase(java.util.Locale.ROOT)){
case "camarad-downloads":return "dev.camarad.simulator";
case "camarad_app":return "dev.camarad.simulator";
case "enduro-club-downloads":return "com.enduromoto.game";
case "enduro_moto":return "com.enduromoto.game";
case "fragment-logo-editor":return "ru.fragment.logoeditor";
case "hvost-pod-kontrolem-downloads":return "ru.dogwatch";
case "hvost-pod-kontrolem":return "ru.dogwatch";
case "screen-recorder-downloads":return "ru.screenrecorder.app";
case "my-projects":return "com.nicolenkoe.hub";
default:return "";}}
}

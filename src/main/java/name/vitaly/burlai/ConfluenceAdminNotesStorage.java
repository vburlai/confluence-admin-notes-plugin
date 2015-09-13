/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

package name.vitaly.burlai;

public interface ConfluenceAdminNotesStorage
{
    String getRawJSONConfig();
    String getPluginsConfig();
    String getPluginConfig(String key);
    boolean updatePluginConfig(String key, String from, String to);
    boolean removePluginConfig(String key, String value);
}
/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

package name.vitaly.burlai;

public interface ConfluenceAdminNotesStorage
{
    String getRawJSONConfig();
    String getConfigSection(String section);
    String getConfigSection(String section, String key);
    boolean updateConfigSection(String section, String key, String from, String to);
    boolean removeConfigSection(String section, String key, String value);
}
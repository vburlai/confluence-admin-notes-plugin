package name.vitaly.burlai;

public interface ConfluenceAdminNotesStorage
{
    String getRawJSONConfig();
    String getPluginsConfig();
    String getPluginConfig(String key);
    // void updatePluginNotes(String key, String notes);
    // void removePluginNotes(String key);
}
/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

package name.vitaly.burlai;

import com.atlassian.sal.api.ApplicationProperties;
import org.apache.commons.io.FileUtils;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.File;
import java.io.IOException;

/**
 * Storing data in [Confluence Home]/Confluence-Admin-Notes-file.json
 */

public class ConfluenceAdminNotesStorageImpl implements ConfluenceAdminNotesStorage
{
    private final String CONFIG_FILE_NAME = "Confluence-Admin-Notes-file.json";

    private File configFile;

    private JSONParser parser = new JSONParser();

    public ConfluenceAdminNotesStorageImpl(ApplicationProperties applicationProperties)
    {
        File homeDirectory = applicationProperties.getHomeDirectory();
        configFile = new File(homeDirectory.getAbsolutePath() + File.separator + CONFIG_FILE_NAME);
    }

    /**
     * Reads config JSON file and returns its contents
     *
     * @return JSON string or empty JSON object "{}"
     */
    public String getRawJSONConfig()
    {
        String res = "";
        if(configFile.exists() && configFile.canRead()) {
            try {
                res = FileUtils.readFileToString(configFile, "UTF-8");
            } catch(IOException e) { e.printStackTrace(); }
        }
        if (res.isEmpty()) {
            res = "{}";
        }
        return res;
    }

    /**
     * Get JSON string with all plugin configs
     *
     * @return JSON string or empty string "{}"
     */
    public String getPluginsConfig()
    {
        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            JSONObject plugins = (JSONObject) json.get("plugins");

            if (plugins == null) {
                return "{}";
            }

            return plugins.toString();
        } catch (ParseException e) { e.printStackTrace(); }

        return "{}";
    }

    /**
     * Gets config for the specified plugin
     *
     * @param key plugin key
     * @return    config string or empty string ""
     */
    public String getPluginConfig(String key)
    {
        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            JSONObject plugins = (JSONObject) json.get("plugins");

            if(key.isEmpty()) {
                return plugins.toJSONString();
            }

            return getPluginConfig(key, plugins);

        } catch (ParseException e) { e.printStackTrace(); }

        return "";
    }

    private String getPluginConfig(String key, JSONObject plugins) {
        if ( key != null && plugins != null) {
            if (plugins.containsKey(key)) {
                return (String) plugins.get(key);
            }
        }
        return "";
    }

    /**
     * Adds/updates config for the specified plugin
     *
     * @param key  plugin key
     * @param from previous value or empty string "" or null
     * @param to   new value
     * @return     true is successful
     */
    public boolean updatePluginConfig(String key, String from, String to)
    {
        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            JSONObject plugins = (JSONObject) json.get("plugins");

            // concurrency check
            if ( ! getPluginConfig(key, plugins).equals( from == null ? "" : from) ) {
                return false;
            }

            if (plugins == null) {
                plugins = new JSONObject();
                json.put("plugins", plugins);
            }

            plugins.put(key, to);

            // Adding new lines for readability
            setRawJSONConfig(json.toJSONString()
                             .replace("\":{", "\":\n{")
                             .replace("\":\"", "\":\n\"")
                             .replace("\",\"", "\",\n\""));

            return true;

        } catch (ParseException e) { e.printStackTrace(); }
          catch (IOException e) { e.printStackTrace(); }

        return false;
    }

    /**
     * Removes config for the specified plugin
     *
     * @param key   plugin key
     * @param value current value stored there (for concurrency)
     * @return      true if successful
     */
    public boolean removePluginConfig(String key, String value)
    {
        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            JSONObject plugins = (JSONObject) json.get("plugins");
            assert plugins != null;

            // concurrency check
            if ( ! getPluginConfig(key, plugins).equals(value) ) {
                return false;
            }

            plugins.remove(key);

            setRawJSONConfig(json.toJSONString());

            return true;

        } catch (ParseException e) { e.printStackTrace(); }
          catch (IOException e) { e.printStackTrace(); }

        return false;
    }

    /**
     * Writes JSON config file (do not call it directly)
     *
     * @param config JSON string
     * @throws IOException If something goes wrong
     */
    public void setRawJSONConfig(String config) throws IOException
    {
        FileUtils.writeStringToFile(configFile, config, "UTF-8");
    }
}
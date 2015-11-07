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
     * Get JSON string for the whole section
     *
     * @param section Section name
     * @return JSON string or empty string "{}"
     */
    public String getConfigSection(String section)
    {
        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            JSONObject config = (JSONObject) json.get(section);

            return config == null ? "{}" : config.toString();
        } catch (ParseException e) { e.printStackTrace(); }

        return "{}";
    }

    /**
     * Gets config for the specified key in the section
     *
     * @param section Section name
     * @param key plugin key
     * @return    config string or empty string ""
     */
    public String getConfigSection(String section, String key)
    {
        if(key == null || key.isEmpty()) {
            return getConfigSection(section);
        }

        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            JSONObject config = (JSONObject) json.get(section);

            return getConfigSection(key, config);

        } catch (ParseException e) { e.printStackTrace(); }

        return "";
    }

    private String getConfigSection(String key, JSONObject config) {
        if ( key != null && config != null) {
            if (config.containsKey(key)) {
                return (String) config.get(key);
            }
        }
        return "";
    }

    /**
     * Adds/updates config for the specified key in specified section
     *
     * @param section Section name
     * @param key  plugin key
     * @param from previous value or empty string "" or null
     * @param to   new value
     * @return     true is successful
     */
    public boolean updateConfigSection(String section, String key, String from, String to)
    {
        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            JSONObject config = (JSONObject) json.get(section);

            // concurrency check
            if ( ! getConfigSection(key, config).equals( from == null ? "" : from) ) {
                return false;
            }

            if (config == null) {
                config = new JSONObject();
                json.put(section, config);
            }

            config.put(key, to);

            setRawJSONConfig(json.toJSONString());

            return true;

        } catch (ParseException e) { e.printStackTrace(); }
          catch (IOException e) { e.printStackTrace(); }

        return false;
    }

    /**
     * Removes config for the specified key in specified section
     *
     * @param key   plugin key
     * @param value current value stored there (for concurrency)
     * @return      true if successful
     */
    public boolean removeConfigSection(String section, String key, String value)
    {
        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            JSONObject config = (JSONObject) json.get(section);

            if (config == null) {
                return false;
            }

            // concurrency check
            if ( ! getConfigSection(key, config).equals(value) ) {
                return false;
            }

            config.remove(key);

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
        String beautified = config.replace("\":{", "\":\n{")
                                  .replace("\":\"", "\":\n\"")
                                  .replace("\",\"", "\",\n\"");
        FileUtils.writeStringToFile(configFile, beautified, "UTF-8");
    }
}
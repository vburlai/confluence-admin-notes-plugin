package name.vitaly.burlai;

import com.atlassian.sal.api.ApplicationProperties;
import org.apache.commons.io.FileUtils;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.File;
import java.io.IOException;

/**
 * Storing data in [Confluence Home]/Confluence-Admin-Notes-file.xml
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

    public String getRawJSONConfig()
    {
        String res = "";
        if(configFile.exists() && configFile.canRead()) {
            try {
                res = FileUtils.readFileToString(configFile, "UTF-8");
            } catch(IOException e) { e.printStackTrace(); }
        }
        return res;
    }

    public String getPluginsConfig()
    {
        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            return json.get("plugins").toString();
        } catch (ParseException e) { e.printStackTrace(); }

        return "";
    }

    public String getPluginConfig(String key)
    {
        try {
            JSONObject json = (JSONObject) parser.parse(getRawJSONConfig());

            JSONObject plugins = (JSONObject) json.get("plugins");
            if(key.isEmpty()) {
                return plugins.toJSONString();
            }
            if(plugins.containsKey(key)) {
                return (String) plugins.get(key);
            }
        } catch (ParseException e) { e.printStackTrace(); }

        return "";
    }
}
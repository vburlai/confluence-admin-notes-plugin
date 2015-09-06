package name.vitaly.burlai;

import com.atlassian.sal.api.ApplicationProperties;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;

/**
 * Storing data in [Confluence Home]/Confluence-Admin-Notes-file.xml
 */

public class ConfluenceAdminNotesStorageImpl implements ConfluenceAdminNotesStorage
{
    private final String CONFIG_FILE_NAME = "Confluence-Admin-Notes-file.xml";

    private File configFile;

    public ConfluenceAdminNotesStorageImpl(ApplicationProperties applicationProperties)
    {
        File homeDirectory = applicationProperties.getHomeDirectory();
        configFile = new File(homeDirectory.getAbsolutePath() + File.separator + CONFIG_FILE_NAME);
    }

    public String getRawXmlConfig()
    {
        String res = "";
        if(configFile.exists() && configFile.canRead()) {
            try {
                res = FileUtils.readFileToString(configFile, "UTF-8");
            } catch(IOException e) { e.printStackTrace(); }
        }
        return res;
    }
}
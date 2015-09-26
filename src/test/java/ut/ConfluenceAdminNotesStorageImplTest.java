/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

package ut;

import com.atlassian.core.util.FileUtils;
import com.atlassian.sal.api.UrlMode;
import junit.framework.TestCase;
import com.atlassian.sal.api.ApplicationProperties;
import name.vitaly.burlai.ConfluenceAdminNotesStorageImpl;

import java.io.File;
import java.util.Date;

public class ConfluenceAdminNotesStorageImplTest extends TestCase {
    File tmp;
    ConfluenceAdminNotesStorageImpl obj;

    public void setUp() throws Exception {
        super.setUp();

        tmp = File.createTempFile("junit", "");
        assertEquals("Delete temporary file", true, tmp.delete());
        assertEquals("Create temporary directory", true, tmp.mkdir());

        ApplicationPropertiesMock ap = new ApplicationPropertiesMock();
        ap.setHomeDirectory(tmp);

        obj = new ConfluenceAdminNotesStorageImpl(ap);
    }

    public void tearDown() throws Exception {
        FileUtils.deleteDir(tmp);
    }

    public void testGetPluginsConfig() throws Exception {
        obj.setRawJSONConfig("{\"test\":\"test\"}");

        assertEquals("Empty config file", "{}", obj.getPluginsConfig());

        String plugins = "{\"abc\":\"efd\"}";
        String json = "{\"test\":\"test\",\n\"plugins\":"+plugins+"}";
        obj.setRawJSONConfig(json);

        assertEquals("Getting 'plugins' part of config", plugins, obj.getPluginsConfig());
    }

    public void testGetPluginConfig() throws Exception {
        String plugins = "{\"abc\":\"def\",\n\"123\":\"456\"}";
        String json = "{\"test\":\"test\",\n\"plugins\":"+plugins+"}";
        obj.setRawJSONConfig(json);

        assertEquals("Getting first record", "def", obj.getPluginConfig("abc"));
        assertEquals("Getting second record", "456", obj.getPluginConfig("123"));
    }

    public void testUpdatePluginConfig() throws Exception {
        obj.setRawJSONConfig("{}");

        obj.updatePluginConfig("test", "", "test test");

        assertEquals("Created new entry", "{\"plugins\":\n{\"test\":\n\"test test\"}}", obj.getRawJSONConfig());

        String config  = "{\"test\":\"test\",\n\"plugins\":{\"123\":\"456\"}}";
        String config2 = "{\"test\":\n\"test\",\n\"plugins\":\n{\"123\":\n\"321\"}}";
        obj.setRawJSONConfig(config);

        obj.updatePluginConfig("123", "", "321");

        assertEquals("Correct previous value should be specified", config, obj.getRawJSONConfig());

        obj.updatePluginConfig("123", "456", "321");

        assertEquals("Record updated successfully", config2, obj.getRawJSONConfig());
    }

    public void testRemovePluginConfig() throws Exception {
        String plugins = "{\"123\":\"456\",\"abc\":\"def\"}";
        String json = "{\"test\":\"test\",\"plugins\":"+plugins+"}";
        obj.setRawJSONConfig(json);

        assertEquals("Initial state set", plugins, obj.getPluginsConfig());

        obj.removePluginConfig("abc", "e");

        assertEquals("Removal should have the current value in params", plugins, obj.getPluginsConfig());

        obj.removePluginConfig("abc", "def");

        assertEquals("Successful removal", "{\"123\":\"456\"}", obj.getPluginsConfig());
    }
}

class ApplicationPropertiesMock implements ApplicationProperties {
    private File tmp;

    @Override
    public String getBaseUrl() {
        return null;
    }

    @Override
    public String getBaseUrl(UrlMode urlMode) {
        return null;
    }

    @Override
    public String getDisplayName() {
        return null;
    }

    @Override
    public String getVersion() {
        return null;
    }

    @Override
    public Date getBuildDate() {
        return null;
    }

    @Override
    public String getBuildNumber() {
        return null;
    }

    @Override
    public File getHomeDirectory() {
        return tmp;
    }
    public void setHomeDirectory(File tmp) {
        this.tmp = tmp;
    }

    @Override
    public String getPropertyValue(String s) {
        return null;
    }
}
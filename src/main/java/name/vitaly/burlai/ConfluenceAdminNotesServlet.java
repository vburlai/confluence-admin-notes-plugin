/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

package name.vitaly.burlai;

import com.atlassian.confluence.security.PermissionManager;
import com.atlassian.confluence.user.AuthenticatedUserThreadLocal;
import com.atlassian.confluence.user.ConfluenceUser;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet providing REST-ful API to the storage
 * (Requires Confluence Admin privileges)
 *
 * url-prefix = /plugins/servlet/confluence-admin-notes/
 *
 * GET [url-prefix]/
 *           shows the whole config
 *
 * GET [url-prefix]/plugins/
 *           shows config for plugins
 *
 * GET [url-prefix]/plugings/[key]
 *           shows config for the specified plugin
 *
 * PUT [url-prefix]/plugings/[key]
 *     from=[existing value or empty string ""]
 *     to=[new value]
 *           sets/updates config for the specified plugin
 *
 * DELETE [url-prefix]/plugings/[key]?value=[existing value]
 *           removes config for the specified plugin
 */

public class ConfluenceAdminNotesServlet extends HttpServlet {
    private PermissionManager permissionManager;
    private ConfluenceAdminNotesStorage storage;
    private String urlPrefix;

    public ConfluenceAdminNotesServlet (PermissionManager pm, ConfluenceAdminNotesStorage storage) {
        this.permissionManager = pm;
        this.storage = storage;
    }

    public void doGet (HttpServletRequest req, HttpServletResponse resp) {
        urlPrefix = getInitParameter("url-prefix");
        if( ! isConfluenceAdmin() ) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // url starts with prefix
        //  /plugins/servlet/confluence-admin-notes/*
        String url = req.getRequestURI();
        int i = url.indexOf(urlPrefix);
        if(i != -1) {
            url = url.substring(i + urlPrefix.length());
        }
        // remove trailing slash
        if(url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }

        if(url.equals("")) {
            printRawJSON(resp);
        } else {
            if(url.equals("plugins")) {
                printPluginConfig(resp, null);
            }
            if(url.startsWith("plugins/")) {
                String pluginkey = url.substring("plugins/".length());
                printPluginConfig(resp, pluginkey);
            }
        }
    }

    public void doPut (HttpServletRequest req, HttpServletResponse resp) throws IOException{
        urlPrefix = getInitParameter("url-prefix");
        if( ! isConfluenceAdmin() ) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // url starts with prefix
        String url = req.getRequestURI();
        int i = url.indexOf(urlPrefix);
        if(i != -1) {
            url = url.substring(i + urlPrefix.length());
        }
        // remove trailing slash
        if(url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }

        if(url.startsWith("plugins/")) {
            String pluginkey = url.substring("plugins/".length());
            String from = req.getParameter("from");
            String to = req.getParameter("to");

            if (storage.updatePluginConfig(pluginkey, from, to)) {
                resp.setStatus(HttpServletResponse.SC_OK);
            } else {
                resp.setStatus(HttpServletResponse.SC_CONFLICT);
                // Let font-end know current value that has caused conflict
                printPluginConfig(resp, pluginkey);
            }

            return;
        }

        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
    }

    public void doDelete (HttpServletRequest req, HttpServletResponse resp) throws IOException{
        urlPrefix = getInitParameter("url-prefix");
        if( ! isConfluenceAdmin() ) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // url starts with prefix
        String url = req.getRequestURI();
        int i = url.indexOf(urlPrefix);
        if(i != -1) {
            url = url.substring(i + urlPrefix.length());
        }
        // remove trailing slash
        if(url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }

        if(url.startsWith("plugins/")) {
            String pluginkey = url.substring("plugins/".length());
            String value = req.getParameter("value");

            if (storage.removePluginConfig(pluginkey, value)) {
                resp.setStatus(HttpServletResponse.SC_OK);
            } else {
                resp.setStatus(HttpServletResponse.SC_CONFLICT);
                // Let font-end know current value that was not deleted
                printPluginConfig(resp, pluginkey);
            }

            return;
        }

        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
    }

    private boolean isConfluenceAdmin() {
        ConfluenceUser u = AuthenticatedUserThreadLocal.get();
        return permissionManager.isConfluenceAdministrator(u);
    }

    private void printRawJSON(HttpServletResponse resp)
    {
        resp.setContentType("application/json");
        try {
            resp.getOutputStream().print(storage.getRawJSONConfig());
        } catch (IOException e) { e.printStackTrace(); }
    }

    private void printPluginConfig(HttpServletResponse resp, String key)
    {
        resp.setContentType("text/plain");
        try {
            if (key == null) {
                resp.getOutputStream().print( storage.getPluginsConfig() );
            } else {
                String json = "{\"" + key +"\":\"" + storage.getPluginConfig(key) + "\"}";
                resp.getOutputStream().print(json);
            }
        } catch (IOException e) { e.printStackTrace(); }
    }
}

/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

package name.vitaly.burlai;

import com.atlassian.confluence.security.PermissionManager;
import com.atlassian.confluence.user.AuthenticatedUserThreadLocal;
import com.atlassian.confluence.user.ConfluenceUser;
import org.json.simple.JSONObject;

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
 * GET [url-prefix]/[section]/
 *           shows config for the section
 *
 * GET [url-prefix]/[section]/[key]
 *           shows config for the specified key in specified section
 *
 * PUT [url-prefix]/[section]/[key]
 *     from=[existing value or empty string ""]
 *     to=[new value]
 *           sets/updates config for the specified key in specified section
 *
 * DELETE [url-prefix]/[section]/[key]?value=[existing value]
 *           removes config for the specified key in specified section
 */

public class ConfluenceAdminNotesServlet extends HttpServlet {
    private PermissionManager permissionManager;
    private ConfluenceAdminNotesStorage storage;
    private String urlPrefix;
    private static final String PLUGINS="plugins";
    private static final String MACROS="macros";

    public ConfluenceAdminNotesServlet (PermissionManager pm, ConfluenceAdminNotesStorage storage) {
        this.permissionManager = pm;
        this.storage = storage;
    }

    public void doGet (HttpServletRequest req, HttpServletResponse resp) {
        urlPrefix = getInitParameter("url-prefix");
        if ( ! isConfluenceAdmin() ) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // url starts with prefix
        //  /plugins/servlet/confluence-admin-notes/*
        String url = req.getRequestURI();
        int i = url.indexOf(urlPrefix);
        if (i != -1) {
            url = url.substring(i + urlPrefix.length());
        }
        // then goes a section name
        String section = "";
        i = url.indexOf("/");
        if (i != -1) {
            section = url.substring(0, i);
            url = url.substring(i + 1);
        }
        // remove trailing slash
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }

        if (section.equals("")) {
            printRawJSON(resp);
        } else {
            if (section.equals(PLUGINS) || section.equals(MACROS)) {
                String key = url.isEmpty() ? null : url;
                printSectionConfig(resp, section, key);
            }
        }
    }

    public void doPut (HttpServletRequest req, HttpServletResponse resp) throws IOException{
        urlPrefix = getInitParameter("url-prefix");
        if ( ! isConfluenceAdmin() ) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // url starts with prefix
        String url = req.getRequestURI();
        int i = url.indexOf(urlPrefix);
        if (i != -1) {
            url = url.substring(i + urlPrefix.length());
        }
        // then goes a section name
        String section = "";
        i = url.indexOf("/");
        if (i != -1) {
            section = url.substring(0, i);
            url = url.substring(i + 1);
        }
        // remove trailing slash
        if(url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }

        if ( (section.equals(PLUGINS) || section.equals(MACROS)) && url.trim().length() > 0) {
            String key = url;
            String from = req.getParameter("from");
            String to = req.getParameter("to");
            if (from != null && to != null &&
                storage.updateConfigSection(section, key, from, to)) {
                resp.setStatus(HttpServletResponse.SC_OK);
            } else {
                resp.setStatus(HttpServletResponse.SC_CONFLICT);
                // Let font-end know current value that has caused conflict
                printSectionConfig(resp, section, key);
            }
        }
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
        // then goes a section name
        String section = "";
        i = url.indexOf("/");
        if (i != -1) {
            section = url.substring(0, i);
            url = url.substring(i + 1);
        }
        // remove trailing slash
        if(url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }

        if ( (section.equals(PLUGINS) || section.equals(MACROS)) && url.trim().length() > 0) {
            String key = url;
            String value = req.getParameter("value");

            if (value != null &&
                storage.removeConfigSection(section, key, value)) {
                resp.setStatus(HttpServletResponse.SC_OK);
            } else {
                resp.setStatus(HttpServletResponse.SC_CONFLICT);
                // Let font-end know current value that was not deleted
                printSectionConfig(resp, section, key);
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private boolean isConfluenceAdmin() {
        ConfluenceUser u = AuthenticatedUserThreadLocal.get();
        return permissionManager.isConfluenceAdministrator(u);
    }

    private void printRawJSON(HttpServletResponse resp)
    {
        resp.setContentType("application/json");
        try {
            resp.getOutputStream().write(storage.getRawJSONConfig().getBytes("UTF-8"));
        } catch (IOException e) { e.printStackTrace(); }
    }

    private void printSectionConfig(HttpServletResponse resp, String section, String key)
    {
        resp.setContentType("application/json");
        try {
            if (key == null) {
                resp.getOutputStream().write( storage.getConfigSection(section).getBytes("UTF-8") );
            } else {
                JSONObject json = new JSONObject();
                json.put(key, storage.getConfigSection(section, key));
                resp.getOutputStream().write(json.toString().getBytes("UTF-8"));
            }
        } catch (IOException e) { e.printStackTrace(); }
    }
}

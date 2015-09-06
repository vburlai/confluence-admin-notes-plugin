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
            resp.getOutputStream().print( key == null ? storage.getPluginsConfig() : storage.getPluginConfig(key));
        } catch (IOException e) { e.printStackTrace(); }
    }
}

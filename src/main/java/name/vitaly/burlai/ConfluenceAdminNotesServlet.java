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

    public ConfluenceAdminNotesServlet (PermissionManager pm, ConfluenceAdminNotesStorage storage) {
        this.permissionManager = pm;
        this.storage = storage;
    }

    public void doGet (HttpServletRequest req, HttpServletResponse resp) {
        if( ! isConfluenceAdmin() ) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        resp.setContentType("text/xml");
        try {
            resp.getOutputStream().print(storage.getRawXmlConfig());
        } catch (IOException e) { e.printStackTrace(); }
    }

    private boolean isConfluenceAdmin() {
        ConfluenceUser u = AuthenticatedUserThreadLocal.get();
        return permissionManager.isConfluenceAdministrator(u);
    }
}

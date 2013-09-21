package org.floodping.BA30.Server.Servlets;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.floodping.BA30.Main;
import org.floodping.BA30.Core.LogTail.Line;
import org.floodping.BA30.Server.Log;

public class TailLogServlet extends HttpServlet
{
	private static final long serialVersionUID = 7086281904629686498L;

	public static String jsonize(String s)
	{
    String r = s.replace("\"", "");
    r = r.replace("\\", "");
    r = r.replace("<", "");
    r = r.replace(">", "");
    return (r);
	}
	
	@Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    response.setContentType("text/json");

    String sMyLineNumber = request.getParameter("MyLineNumber");
    int uiMyLineNumber = 0;
    try 
    {
     uiMyLineNumber = Integer.parseInt(sMyLineNumber);
    }
    catch (Exception e)
    {
    }
    
    int uiMaxLineNumber = Main.m_TailLog.GetMaxLineNumber();
    
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().println("{ \"maxlinenumber\" : " + uiMaxLineNumber + ", \"values\" : [");

    boolean bFirst = true;
    int uiCount = 0;
    for (int uiIndex = uiMyLineNumber + 1; uiIndex <= uiMaxLineNumber; uiIndex++)
    {
      uiCount++;
      Line l = Main.m_TailLog.GetLine(uiIndex);
  
      if(bFirst)
      {
        bFirst = false;
      }
      else
      {
        response.getWriter().print(",");
      }
      response.getWriter().println("{\"linenumber\":" + uiIndex + ",");
      response.getWriter().println("" +
          "\"host\":\"" + jsonize(l.sHost) + "\"," +
          "\"ip\":\"" + l.IP + "\"," +
          "\"date\":\"" + l.Date + "\"," +
          "\"cmd\":\"" + jsonize(l.Cmd) + "\"," +
          "\"result\":\"" + l.Result + "\"," +
          "\"query\":\"" + jsonize(l.sQuery) + "\"," +
          "\"size\":\"" + l.Size + "\"," +
          "\"referrer\":\"" + jsonize(l.Referrer) + "\"," +
          "\"ua\":\"" + jsonize(l.UA) + "\"" +
      		"}");
      if (uiCount > 200)
      {
        break;
      }
    }
    response.getWriter().println("] }");
  }
}

package org.floodping.BA30.Server;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.floodping.BA30.Server.Servlets.TailLogServlet;
import org.floodping.BA30.Server.Servlets.WhoisServlet;

public class Webserver implements Runnable
{
  private String m_sResourceFolder = null;
	private Thread m_Thread;
	private Server m_Server;
	
	public Webserver (String sResourceFolder)
	{
		m_sResourceFolder = sResourceFolder;
	}
	
	public void runWebserver ()
	{
		m_Thread = new Thread(this);
		m_Thread.setName("Webserver");
		m_Thread.start();
	}
	
	public void stopWebserver()
	{
		try
		{
			m_Thread.interrupt();
			m_Server.stop();
		} catch (Exception e)
		{
			e.printStackTrace();
		}
	}
	
	public void run()
	{
		try {
			m_Server = new Server(8123);

	    ServletContextHandler servletContext = new ServletContextHandler(ServletContextHandler.SESSIONS);
			servletContext.setContextPath("/servlet");
      servletContext.addServlet(new ServletHolder(new TailLogServlet()),"/TailLog");
      servletContext.addServlet(new ServletHolder(new WhoisServlet()),"/Whois");

      ResourceHandler resourceHandler = new ResourceHandler();
      resourceHandler.setDirectoriesListed(true);
      resourceHandler.setWelcomeFiles(new String[]{ "index.html" });
      resourceHandler.setResourceBase(m_sResourceFolder);

      ContextHandler fileHandler = new ContextHandler();
      fileHandler.setContextPath("/");
      fileHandler.setHandler(resourceHandler);

      ContextHandlerCollection contexts = new ContextHandlerCollection();
      contexts.setHandlers(new Handler[] { servletContext, fileHandler });
      
      
      m_Server.setHandler(contexts);
        
      m_Server.start();
			m_Server.join();
		}
		catch (Exception e) {
			e.printStackTrace();
		}
	}

}

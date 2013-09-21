package org.floodping.BA30;

import java.text.DateFormat;
import java.util.Date;

import org.floodping.BA30.Core.LogTail;
import org.floodping.BA30.Server.Log;
import org.floodping.BA30.Server.Webserver;

public class Main {

  private static Webserver m_Webserver = null;
  
  private static int m_uiErrorCount = 0;
  public static long m_udOutToInSendCount = 0;

//	private static Thread m_MainThread;
	public static long udNow;
	
	public static long m_udProfile[] = new long[10];
  public static String m_sResourceFolder;
  public static String m_sLogFile = "/var/logs/apache/access_log";
  public static int m_uiPort = 8765;
  public static LogTail m_TailLog;

  public static void sleep(int uiMillis)
  {
  	try
  	{
  		Thread.sleep(uiMillis);
  	}
  	catch(Exception e)
  	{
  		//
  	}
  }

  public static int getErrorCount()
  {
    return m_uiErrorCount;
  }
  
  public static void ErrorCount()
  {
  	m_uiErrorCount++;

  	System.err.println("---------------------------------------------------------------------");
  	System.err.println("Fehler #" + m_uiErrorCount + " um " + DateFormat.getInstance().format(new Date()));
  	Exception e = new Exception();
  	e.printStackTrace();
  	System.err.println("/////////////////////////////////////////////////////////////////////");
  	
  	if(m_uiErrorCount > 10)
  	{
//    	m_MainThread.interrupt();
  	}
  }

  /**
	 * @param args
	 */
	public static void main(String[] args)
	{
    m_sResourceFolder = Main.class.getClassLoader().getResource("resources/").toString();

    for(int uiIndex = 0; uiIndex < args.length; uiIndex++)
    {
      if ("--log".equals(args[uiIndex]) && uiIndex+1 < args.length)
      {
        m_sLogFile = args[uiIndex+1];
        uiIndex++;
      }
      if ("--port".equals(args[uiIndex]) && uiIndex+1 < args.length)
      {
        m_uiPort = Integer.parseInt(args[uiIndex+1]);
        uiIndex++;
      }
    }
    
    Log.Info("SRV", "Resources:" + m_sResourceFolder);
    Log.Info("SRV", "Logfile:" + m_sLogFile);
    
    m_TailLog = new LogTail();
    m_TailLog.runTail();
    
		m_Webserver = new Webserver(m_sResourceFolder + "www/");
		m_Webserver.runWebserver();
		
		try
		{
			while(true)
			{
				Thread.sleep(100000);
			}
		}
		catch (InterruptedException e)
		{
		}
		
		m_Webserver.stopWebserver();
		m_TailLog.stopTail();
		
		System.exit(1);
	}
}

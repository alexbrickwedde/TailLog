package org.floodping.BA30.Server;

import java.util.LinkedList;

public class Log
{
  public static class LogEntry
  {
    public long m_lNow;
    public long m_lNr;
    public int m_uiLevel;
    public String m_sSubsystem;
    public String m_sMsg;
  }

  private static long m_lCount = 0;
  private static LinkedList<LogEntry> m_vMsgs = new LinkedList<Log.LogEntry>();
  
  public static void CleanUp()
  {
    while (m_vMsgs.size() > 20)
    {
      m_vMsgs.removeFirst();
    }
  }
  
  public static void Debug (String sSubsystem, String sMsg)
  {
    LogEntry e = new LogEntry();
    e.m_sMsg = sMsg;
    e.m_sSubsystem = sSubsystem;
    e.m_uiLevel = 3;
    e.m_lNow = System.currentTimeMillis();
    m_vMsgs.addLast(e);
    e.m_lNr = m_lCount++;
    Log.CleanUp();
    System.out.println(sSubsystem + ":" + sMsg);
  }
  
  public static void Info (String sSubsystem, String sMsg)
  {
    LogEntry e = new LogEntry();
    e.m_sMsg = sMsg;
    e.m_sSubsystem = sSubsystem;
    e.m_uiLevel = 2;
    e.m_lNow = System.currentTimeMillis();
    m_vMsgs.addLast(e);
    e.m_lNr = m_lCount++;
    Log.CleanUp();
    System.out.println(sSubsystem + ":" + sMsg);
  }
  
  public static void Warn (String sSubsystem, String sMsg)
  {
    LogEntry e = new LogEntry();
    e.m_sMsg = sMsg;
    e.m_sSubsystem = sSubsystem;
    e.m_uiLevel = 1;
    e.m_lNow = System.currentTimeMillis();
    m_vMsgs.addLast(e);
    e.m_lNr = m_lCount++;
    Log.CleanUp();
    System.err.println(sSubsystem + ":" + sMsg);
  }

  public static void Error (String sSubsystem, String sMsg)
  {
    LogEntry e = new LogEntry();
    e.m_sMsg = sMsg;
    e.m_sSubsystem = sSubsystem;
    e.m_uiLevel = 0;
    e.m_lNow = System.currentTimeMillis();
    m_vMsgs.addLast(e);
    e.m_lNr = m_lCount++;
    Log.CleanUp();
    System.err.println(sSubsystem + ":" + sMsg);
  }
  
  public static LogEntry GetEntry(long uiIndex)
  {
    for(LogEntry e : m_vMsgs)
    {
      if (e.m_lNr == uiIndex)
      {
        return e;
      }
      if (e.m_lNr > uiIndex)
      {
        return null;
      }
    }
    return null;
  }

  public static long GetEntryCount()
  {
    return (m_lCount);
  }
  
  public void info(String sSubsystem, String sMsg)
  {
    Log.Info(sSubsystem, sMsg);
  }
  
  public void warn(String sSubsystem, String sMsg)
  {
    Log.Warn(sSubsystem, sMsg);
  }
  
  public void error(String sSubsystem, String sMsg)
  {
    Log.Error(sSubsystem, sMsg);
  }
}

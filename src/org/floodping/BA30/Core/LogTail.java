package org.floodping.BA30.Core;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.floodping.BA30.Main;

public class LogTail implements Runnable
{
  static public class Line
  {
    public String sHost;
    public String IP;
    public String x1;
    public String x2;
    public String Date;
    public String Cmd;
    public String Result;
    public String Size;
    public String Referrer;
    public String UA;
    public String sQuery;
  }

  private int uiMaxLineNumber = -1;
  public int GetMaxLineNumber()
  {
    return uiMaxLineNumber;
  }

  private LinkedList<Line> m_Lines = new LinkedList<Line>();
  private HashMap<String, String> m_IPs = new HashMap<String, String>();
  private HashMap<String, String> m_Qs = new HashMap<String, String>();

  synchronized Line AddLine(
      String sHost,
      String IP,
      String x1,
      String x2,
      String Date,
      String Cmd,
      String Result,
      String Size,
      String Referrer,
      String UA,
      String sQuery)
  {
    uiMaxLineNumber++;
    Line l = new Line();
    l.sHost = sHost;
    l.IP = IP;
    l.x1 = x1;
    l.x2 = x2;
    l.Date = Date;
    l.Cmd = Cmd;
    l.Result = Result;
    l.Size = Size;
    l.Referrer = Referrer;
    l.UA = UA;
    l.sQuery = sQuery;
    m_Lines.add(l);
    uiMaxLineNumber = m_Lines.lastIndexOf(l);
    return l;
  }

  public synchronized Line GetLine(int uiLineNumber)
  {
    Line l = m_Lines.get(uiLineNumber);
    return l;
  }

  @Override
  public void run()
  {
    try
    {
      FileReader fr;
      BufferedReader br = null;
      try
      {
        //fr = new FileReader(new File("c:\\temp\\accesslog.txt"));
        File f = new File(Main.m_sLogFile);
        fr = new FileReader(f);
        br = new BufferedReader(fr);
        long lSkip = f.length();
        if (lSkip > 500000)
        {
          lSkip -= 500000; 
          br.skip(lSkip);
          br.readLine();
        }
        String line;
        while (true)
        {
          line = br.readLine();
          if (line == null)
          {
            Thread.sleep(1000);
          }
          else
          {
            Matcher m = Pattern.compile("^::1").matcher(line);
            if (m.find())
            {
              continue;
            }
            m = Pattern.compile("^([0-9]*\\.[0-9]*\\.[0-9]*\\.[0-9]*) (.*) (.*) (\\[.*\\]) (\".*\") (.*) (.*) (\".*\") (\".*\")$").matcher(line);
            if (m.find())
            {
              String IP = m.group(1);
              String x1 = m.group(2);
              String x2 = m.group(3);
              String Date = m.group(4);
              String Cmd = m.group(5);
              
              if (Cmd.contains(".jpg ") || Cmd.contains(".gif ") || Cmd.contains(".png ") || Cmd.contains(".php ") || Cmd.contains(".ico ") || Cmd.contains(".css ") || Cmd.contains(".js "))
              {
                continue;
              }
              
              String Result = m.group(6);
              String Size = m.group(7);
              String Referrer = m.group(8);
              String UA = m.group(9);
              if (UA.contains("MJ12bot") || UA.contains("LinksCrawler") || UA.contains("Infohelfer") || UA.contains("meanpathbot") || 
                  UA.contains("YodaoBot") || UA.contains("checks.panopta.com") || UA.contains("wortschatz.uni-leipzig.de") || 
                  UA.contains("YandexBot") || UA.contains("AhrefsBot") || UA.contains("80legs") || 
                  UA.contains("bingbot") || UA.contains("Googlebot") || UA.contains("msnbot") || 
//                  UA.contains("") || UA.contains("") || UA.contains("") || 
//                  UA.contains("") || UA.contains("") || UA.contains("") || 
//                  UA.contains("") || UA.contains("") || UA.contains("") || 
//                  UA.contains("") || UA.contains("") || UA.contains("") || 
                  UA.contains("SemrushBot") || UA.contains("VoilaBot"))
              {
                continue;
              }

              //"SISTRIX" -e "eichenauersv.de" -e "i-market-bot" -e "Sosospider" -e "Spiderlytics" -e "BLEXBot" -e "AdsBot" 
              //-e "Baiduspider" -e "" -e "" -e "Exabot" -e "nrsbot" -e "Comodo-Certificates-Spider" 
              //-e "ezooms.bot" -e "" -e "UnisterBot" -e "" -e "" -e "internal dummy connection"
              //-e "\"\GET \/images\/" -e "\"\HEAD \/images\/" 
              //-e "KomodiaBot" -e "Sogou web spider" -e "JikeSpider" -e "360Spider" -e "SurveyBot" -e "guoming" -e "SiteExplorer"
              //-e "SeznamBot" -e "NCBot" -e "" -e "ia_archiver" -e "Nutch" -e "AdnormCrawler" -e "CareerBot" -e "YYSpider"
              //-e "^119.63.193.195" -e "NetcraftSurveyAgent" -e "w00tw00t" -e "soapCaller.bs" -e "scripts.setup\.php"
              //-e "YisouSpider" -e "HNAP1" -e "%70%68%70%70" -e "php.connector\.php" -e "^202\.46\."
              
              
              String sQuery = m_Qs.get(IP);
              if(sQuery == null)
              {
                sQuery = "";
                int uiIndex = Referrer.indexOf("&q=");
                if (uiIndex < 0)
                {
                  uiIndex = Referrer.indexOf("?q=");
                }
                if (uiIndex > 0)
                {
                  sQuery = Referrer.substring(uiIndex + 1);
                  uiIndex = sQuery.indexOf("&");
                  if (uiIndex > 0)
                  {
                    sQuery = sQuery.substring(0, uiIndex);
                  }
                  m_Qs.put(IP, sQuery);
                }
              }

              String sCachedIp = m_IPs.get(IP);
              if (sCachedIp == null)
              {
                try
                {
                  InetAddress addr = InetAddress.getByName(IP);
                  String host = addr.getHostName();
                  if(host != null && host.length() > 0 && !host.equals(IP))
                  {
                    m_IPs.put(IP, host);
                    AddLine(host, IP, x1, x2, Date, Cmd, Result, Size, Referrer,UA, sQuery);
                  }
                  else
                  {
                    m_IPs.put(IP, "-");
                    AddLine("-", IP, x1, x2, Date, Cmd, Result, Size, Referrer,UA, sQuery);
                  }
                }
                catch (Exception e)
                {
                  AddLine("-", IP, x1, x2, Date, Cmd, Result, Size, Referrer,UA, sQuery);
                }
              }
              else
              {
                AddLine(sCachedIp, IP, x1, x2, Date, Cmd, Result, Size, Referrer,UA, sQuery);
              }
            }
            else
            {
              AddLine("xxx", "","","","","","","","","invalid", "");
            }
          }
        }
      }
      catch (FileNotFoundException e)
      {
        e.printStackTrace();
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
      if (br != null)
      {
        try
        {
          br.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
    catch (InterruptedException e)
    {
    }
  }

  private Thread m_RunThread = null;

  public void runTail()
  {
    this.m_RunThread = new Thread(this);
    this.m_RunThread.setName("Network");
    this.m_RunThread.start();
  }

  public void stopTail()
  {
    if (this.m_RunThread != null)
    {
      this.m_RunThread.interrupt();
    }
  }
}

package org.floodping.BA30.Server.Servlets;

import java.io.IOException;
import java.net.SocketException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.net.whois.WhoisClient;

public class WhoisServlet extends HttpServlet
{
  private static Pattern pattern;
  private Matcher matcher;
  
  private static final String WHOIS_SERVER_PATTERN = "Whois Server:\\s(.*)";
  static {
    pattern = Pattern.compile(WHOIS_SERVER_PATTERN);
  }
  
  public String getWhois(String domainName) {
    
    StringBuilder result = new StringBuilder("");
 
    WhoisClient whois = new WhoisClient();
    try {
 
      whois.connect("whois.geektools.com");
 
      // whois =google.com
      String whoisData1 = whois.query(domainName);
 
      // append first result
      result.append(whoisData1);
      whois.disconnect();
 
      // get the google.com whois server - whois.markmonitor.com
      String whoisServerUrl = getWhoisServer(whoisData1);
      if (!whoisServerUrl.equals("")) {
 
      // whois -h whois.markmonitor.com google.com
      String whoisData2 = 
                            queryWithWhoisServer(domainName, whoisServerUrl);
 
      // append 2nd result
      result.append(whoisData2);
      }
 
    } catch (SocketException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
 
    return result.toString();
 
  }
 
  private String queryWithWhoisServer(String domainName, String whoisServer) {
 
    String result = "";
    WhoisClient whois = new WhoisClient();
    try {
 
      whois.connect(whoisServer);
      result = whois.query(domainName);
      whois.disconnect();
 
    } catch (SocketException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
 
    return result;
 
  }
 
  private String getWhoisServer(String whois) {
 
    String result = "";
 
    matcher = pattern.matcher(whois);
 
    // get last whois server
    while (matcher.find()) {
      result = matcher.group(1);
    }
    return result;
  }
  
  private static final long serialVersionUID = 7086281904629686498L;

	@Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    response.setContentType("text/json");

    String sIP = request.getParameter("ip");
    
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().println(this.getWhois(sIP));
  }
}

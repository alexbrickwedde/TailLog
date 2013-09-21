// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------

var BA30__g_aJSObjects = [];
var BA30__g_uiJSObjectCounter = 0;

function RegisterObject (oObj)
{
  BA30__g_aJSObjects[BA30__g_uiJSObjectCounter] = oObj;
  oObj.m_uiJSObjectIndex = BA30__g_uiJSObjectCounter;
  BA30__g_uiJSObjectCounter++;
}

function TimeoutObject (uiJSObjectIndex, sFunction)
{
  var oObj = BA30__g_aJSObjects[uiJSObjectIndex];
  if (oObj && oObj[sFunction])
  {
    oObj[sFunction]();
  }
}

function DoTimeout (oObj, sFunction, uiTimeout)
{
  console.log("DoTimeout sFunction=" + sFunction + ", uiTimeout=" + uiTimeout);
  return setTimeout("TimeoutObject(" + oObj.m_uiJSObjectIndex + ",'" + sFunction + "');", uiTimeout);
}


/*******************************************************************************
 * @interface
 */
function Connection () { /**/ }
Connection.prototype.Request = function () { /**/ };

/*******************************************************************************
 * @interface
 */
function ConnectionCallback () { /**/ }

/*******************************************************************************
 * @param {Connection} Conn
 * @param {string} sRes
 */
ConnectionCallback.prototype.OnReady = function (Conn, sRes) { /**/ };

/*******************************************************************************
 * @param {Connection} Conn
 * @param {string} sRes
 */
ConnectionCallback.prototype.OnFailed = function (Conn, sRes) { /**/ };

// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------

/*******************************************************************************
 * @constructor
 * @implements {Connection}
 */
function ServerConnection_XHR ()
{
  this.m_HttpReq = new XMLHttpRequest();
  this.m_sMethod = "GET";
  this.m_sUrl = "";
  this.m_bAsync = true;
  /** @type {ConnectionCallback} */
  this.m_Target = null;
}

ServerConnection_XHR.prototype.Request = function Request ()
{
  try 
  {
    this.m_HttpReq.addEventListener('abort', Vizab_OnFailed); 
    this.m_HttpReq.addEventListener('error', Vizab_OnFailed); 

    this.m_HttpReq.open(this.m_sMethod, this.m_sUrl, this.m_bAsync);
  
    this.m_HttpReq.onreadystatechange = Vizab_OnReadyStateChange;

//    this.m_HttpReq.onload = Vizab_OnReadyStateChange;
//    this.m_HttpReq.onerror = Vizab_OnFailed;
//    this.m_HttpReq.onabort = Vizab_OnFailed;
 
    
    this.m_HttpReq.m_oObj = this;

    this.m_HttpReq.send();
  }
  catch(e)
  {
    this.m_Target.OnFailed(this, this.m_HttpReq.responseText);
    return (false);
  }
  window.console.log("SENT");

  if (this.m_bAsync)
  {
    return (true);
  }
  this.m_bAsync = false; // reset to default value
  return (this.m_HttpReq.responseText);
};

ServerConnection_XHR.prototype.OnReadyStateChanged = function OnReadyStateChanged ()
{
  switch (this.m_HttpReq.readyState)
  {
  case 4:
    if (this.m_Target)
    {
      window.console.log ("HTTP Status" + this.m_HttpReq.status);
      if (this.m_HttpReq.status == 200)
      {
        this.m_Target.OnReady(this, this.m_HttpReq.responseText);
      }
      else
      {
        this.m_Target.OnFailed(this, this.m_HttpReq.responseText);
      }
    }
    break;
  }
};

ServerConnection_XHR.prototype.OnFailed = function OnFailed ()
{
  this.m_Target.OnFailed(this);
};

// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------

function BA30 (sBaseUrl)
{
  console.log("BA30.construct");
  RegisterObject(this);
  this.m_oObj = window;
  this.m_aValues = [];
  this.m_bValuesLoaded = false;
  this.m_bServerOffline = false;
  this.m_sBaseUrl = sBaseUrl;

  this.m_bLog = false;
  
  this.m_uiLogUpdateIndex = 0;
  this.m_aLogEntries = [];
  
  this.m_uiTimeoutUpdate = 20000;
}

BA30.prototype.Start = function Start ()
{
  this.Inform ();
  this.Update();
  if (this.m_bLog)
  {
    this.LogUpdate ();
  }
};

BA30.prototype.OnTimeoutUpdate = function OnTimeoutUpdate ()
{
  this.m_tTimeoutUpdate = null;
  console.log("BA30.OnTimeoutUpdate");
  this.Update(true);
};

BA30.prototype.SetValue = function SetValue (oValue, sValue)
{
  console.log("BA30.SetValue");
  var Request;
  Request = new ServerConnection_XHR();
  var sName = oValue.m_sName.replace("*", "in");
  Request.m_sUrl = this.m_sBaseUrl + "URIWrite?URI=" + encodeURIComponent(sName) + "&value=" + encodeURIComponent(sValue);
  Request.Request();
  return (true);
};

BA30.prototype.LogUpdate = function LogUpdate ()
{
  console.log("BA30.LogUpdate");
  if (!this.m_LogUpdateRequest)
  {
    this.m_LogUpdateRequest = new ServerConnection_XHR();
    this.m_LogUpdateRequest.m_Target = this;
    this.m_LogUpdateRequest.m_bAsync = true;
    this.m_LogUpdateRequest.m_bLogUpdate = true;
  }
  this.m_LogUpdateRequest.m_sUrl = this.m_sBaseUrl + "Log?index=" + this.m_uiLogUpdateIndex;
  this.m_LogUpdateRequest.Request();
};

BA30.prototype.Update = function Update ()
{
  console.log("BA30.Update");
  if (!this.m_UpdateRequest)
  {
    this.m_UpdateRequest = new ServerConnection_XHR();
    this.m_UpdateRequest.m_Target = this;
    this.m_UpdateRequest.m_bAsync = true;
    this.m_UpdateRequest.m_bUpdate = true;
  }
  this.m_UpdateRequest.m_sUrl = this.m_sBaseUrl + "URIRead?URI=.*/.*/.*";
  this.m_UpdateRequest.Request();
};

BA30.prototype.Inform = function Inform ()
{
  console.log("BA30.Inform");
  if (!this.m_InformRequest)
  {
    this.m_InformRequest = new ServerConnection_XHR();
    this.m_InformRequest.m_Target = this;
    this.m_InformRequest.m_bAsync = true;
    this.m_InformRequest.m_bInform = true;
  }
  this.m_InformRequest.m_sUrl = this.m_sBaseUrl + "URIEvent?timeout=10000&URI=.*/.*/.*";
  this.m_InformRequest.Request();
};

function FormatMs(t)
{
  var h = t.getHours();
  var m = t.getMinutes();
  var s = t.getSeconds();
  var ms = t.getMilliseconds();
  if (m < 10)
  {
    m = "0" + m;
  }
  if (s < 10)
  {
    s = "0" + s;
  }
  if (ms < 10)
  {
    ms = "000" + ms;
  }
  else if (ms < 100)
  {
    ms = "00" + ms;
  }
  else if (ms < 1000)
  {
    ms = "0" + ms;
  }
  return h+":"+m+":"+s+"."+ms;
}

BA30.prototype.OnReady = function OnReady (Request, sResult)
{
	console.log("BA30.OnReady jsonlist:" + (Request.m_bInform == true));
	if (this.m_bServerOffline)
	{
	  document.location.reload(true);
	  return;
	}

  if (Request.m_bLogUpdate)
  {
    try {
      var aResultSet = JSON.parse(sResult);
      var aResults = aResultSet["values"];
      for ( var uiListIndex = 0; uiListIndex < aResults.length; uiListIndex++)
      {
        var oLogEntry = aResults[uiListIndex];
        if (oLogEntry.index > this.m_uiLogUpdateIndex)
        {
          this.m_uiLogUpdateIndex = oLogEntry.index;
        }
        this.m_aLogEntries.push(oLogEntry);
      }
      
      var Div = document.getElementById("log");
      if (Div)
      {
        this.m_aLogEntries.sort(function(a,b){
          if (a.index > b.index)
          {
            return -1;
          }
          if (a.index < b.index)
          {
            return 1;
          }
          return 0;
        });
  
        Div.innerHTML = "";
        
        var table = document.createElement("table");
        Div.appendChild(table);
        
        for(var i = 0; i < this.m_aLogEntries.length; i++)
        {
          var Entry = this.m_aLogEntries[i];
          var tr = document.createElement("tr");
          table.appendChild(tr);
          var t = new Date();
          t.setTime(Entry.time);
          tr.innerHTML = "<td style='white-space:nowrap'>" + FormatMs(t) + "</td><td style='white-space:nowrap'>" + Entry.index + "</td><td style='white-space:nowrap'>" + Entry.subsystem + "</td><td style='white-space:nowrap'>" + Entry.msg + "</td>";
          if (i>1000)
          {
            break;
          }
        }
      }
    }
    catch(e)
    {
      console.log(e);
    }
    DoTimeout (this, "LogUpdate", 1000);
    return;
  }
  
  if (Request.m_bInform)
  {
    this.Inform ();
    this.Update ();
    return;
  }
  
	var bOk = false;
	try
	{
	  var aResultSet = JSON.parse(sResult);
	
	  var aResults = aResultSet["values"];
	  for ( var uiListIndex = 0; uiListIndex < aResults.length; uiListIndex++)
	  {
	    var oList = aResults[uiListIndex];
	    var oOldValue = this.GetValue(oList["NAME"]);
	    if (!oOldValue)
	    {
	      var oNewValue = new FHEMValue(oList, this);
	      this.m_aValues.push(oNewValue);
	      oNewValue.Internal_SendUpdate();
	      continue;
	    }
	    var sOld = oOldValue.GetValue();
	    var sNew = oList["STATE"];
	    if (sOld != sNew)
	    {
	      oOldValue.Internal_SetValue(sNew);
	    }
	  }
	
	  bOk = true;
	}
	catch (e)
	{
		console.log("BA30.OnReady Exception");
		debugger;
	}
	
	if (bOk && !this.m_bValuesLoaded)
	{
	  this.m_oObj.OnValuesLoaded(this);
	  this.m_bValuesLoaded = true;
	}
	this.m_oObj.OnValuesUpdated(this);
};

BA30.prototype.OnFailed = function OnFailed (Request, sResult)
{
  console.log("BA30.OnFailed jsonlist");

  if (!this.m_bServerOffline)
  {
    this.m_bServerOffline = true;
  
    var Div = document.createElement("div");
    Div.style.backgroundColor = "#cc0000";
    Div.style.position = "absolute";
    Div.style.left = "0px";
    Div.style.top = "0px";
    Div.style.bottom = "0px";
    Div.style.right = "0px";
    Div.style.opacity = "0.50";
    Div.style.textAlign = "center";
    Div.style.fontSize = "128pt";
    Div.innerHTML = "<br>OFFLINE";
    
    document.body.appendChild(Div);
  }
  
  DoTimeout (this, "Inform", 1000);
};

BA30.prototype.GetValue = function GetValue (sName)
{
  for ( var uiIndex = 0; uiIndex < this.m_aValues.length; uiIndex++)
  {
    if (!this.m_aValues[uiIndex])
      continue;
    if (this.m_aValues[uiIndex].m_sName == sName)
    {
      return this.m_aValues[uiIndex];
    }
  }

  var oNewValue = new FHEMValue({
    NAME : sName,
    STATE : "???"
  }, this);
  this.m_aValues.push(oNewValue);
  return (oNewValue);
};

// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------

/*******************************************************************************
 * @interface
 */
function BA30Value ()
{ /**/
}
BA30Value.prototype.Register = function ()
{ /**/
};
BA30Value.prototype.SetValue = function ()
{ /**/
};
/*
 * @returns {(string|number)}
 */
BA30Value.prototype.GetValue = function ()
{ /**/
};
BA30Value.prototype.Internal_SetValue = function ()
{ /**/
};
BA30Value.prototype.Internal_SendUpdate = function ()
{ /**/
};

/*******************************************************************************
 * @constructor
 * @implements {BA30Value}
 * @param {BA30Value}
 *          oValue
 * @param {FHEM}
 *          oFHEM
 */
function FHEMValue (oValue, oFHEM)
{
  console.log("new FHEMValue");
  this.m_oFHEM = oFHEM;
  this.m_sName = oValue["NAME"];
  this.m_sValue = oValue["STATE"];
  this.m_oDevice = oValue;
  this.m_aRegisteredOnChange = [];
}

FHEMValue.prototype.Internal_SetValue = function Internal_SetValue (sValue)
{
  this.m_sValue = sValue;
  this.Internal_SendUpdate();
};

FHEMValue.prototype.Internal_SendUpdate = function Internal_SendUpdate (sValue)
{
  for ( var uiIndex in this.m_aRegisteredOnChange)
  {
    var o = this.m_aRegisteredOnChange[uiIndex];
    if (o && o.OnValueChanged)
    {
      o.OnValueChanged(this);
    }
  }
};

FHEMValue.prototype.Register = function Register (oObject)
{
  this.m_aRegisteredOnChange.push(oObject);
  this.Internal_SendUpdate();
};

/*******************************************************************************
 * @returns {(string|number)}
 */
FHEMValue.prototype.GetValue = function GetValue ()
{
  return this.m_sValue;
};

FHEMValue.prototype.SetValue = function SetValue (sValue)
{
  return this.m_oFHEM.SetValue(this, sValue);
};

// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------

/*******************************************************************************
 * @constructor
 * @param {Element}
 *          ParentDiv
 * @param {BA30Value}
 *          oValue
 * @param {array}
 *          aCss
 */
function LampButton (ParentDiv, oOutValue, oInValue, aCss, sPrefix, sExtension)
{
  var Div = document.createElement("img");
  Div.className = "ClassLampButton";
  ApplyCss(Div, aCss);
  Div.style.position = "absolute";
  ParentDiv.appendChild(Div);
  this.m_Div = Div;
  this.m_oOutValue = oOutValue;
  this.m_oInValue = oInValue;
  this.m_bDimmable = false;
  this.m_sPrefix = sPrefix ? sPrefix + "_" : "";
  this.m_sExtension = sExtension ? ("" + sExtension) : "png";

  Div.onclick = Vizab_OnClick;
  Div.onmousedown = Vizab_OnMouseDown;
  Div.oObject = this;
  oOutValue.Register(this);
}

/*******************************************************************************
 * @param {Event}
 *          Event
 * @returns {boolean}
 */
LampButton.prototype.OnMouseDown = function OnMouseDown (Event)
{
  if ((Event.button == 2) && (this.m_bDimmable))
  {
    Event.stopPropagation();
    var sValue = prompt("Enter new dim value:", "50%");
    var iValue = parseInt(sValue, 10);
    if (isFinite(iValue))
    {
      this.m_oInValue.SetValue(iValue + "%");
    }
    return (false);
  }
  return (false);
};

/*******************************************************************************
 * @param {Event}
 *          Event
 * @returns {boolean}
 */
LampButton.prototype.OnClick = function OnClick (Event)
{
  if (this.m_oOutValue.GetValue() == "off")
  {
    this.m_oInValue.SetValue("on");
  }
  else
  {
    this.m_oInValue.SetValue("off");
  }
  return (false);
};

/*******************************************************************************
 * @param {BA30Value}
 *          oValue
 */
LampButton.prototype.OnValueChanged = function OnValueChanged (oValue)
{
  var sValue = oValue.GetValue();
  var iValue = parseInt(sValue);
  if (!isFinite(iValue))
  {
    switch (sValue)
    {
    case "on":
    case "off":
    case "open":
    case "closed":
      this.m_Div.src = sBA30MainFolder + "ba30/png/" + this.m_sPrefix + sValue + "." + this.m_sExtension;
      break;

    case "MISSING ACK":
    default:
      this.m_Div.src = sBA30MainFolder + "ba30/png/error.png";
      break;
    }
  }
  else
  {
    if (iValue < 0)
    {
      sValue = "off";
    }
    else if (iValue < 9)
    {
      sValue = "dim06";
    }
    else if (iValue < 15)
    {
      sValue = "dim12";
    }
    else if (iValue < 21)
    {
      sValue = "dim18";
    }
    else if (iValue < 28)
    {
      sValue = "dim25";
    }
    else if (iValue < 34)
    {
      sValue = "dim31";
    }
    else if (iValue < 40)
    {
      sValue = "dim37";
    }
    else if (iValue < 46)
    {
      sValue = "dim43";
    }
    else if (iValue < 53)
    {
      sValue = "dim50";
    }
    else if (iValue < 59)
    {
      sValue = "dim56";
    }
    else if (iValue < 65)
    {
      sValue = "dim62";
    }
    else if (iValue < 71)
    {
      sValue = "dim68";
    }
    else if (iValue < 78)
    {
      sValue = "dim75";
    }
    else if (iValue < 84)
    {
      sValue = "dim81";
    }
    else if (iValue < 90)
    {
      sValue = "dim87";
    }
    else if (iValue < 96)
    {
      sValue = "dim93";
    }
    else
    {
      sValue = "on";
    }
    this.m_Div.src = sBA30MainFolder + "ba30/png/" + sValue + ".png";
  }
};

// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------

/*******************************************************************************
 * @constructor
 * @param {Element}
 *          ParentDiv
 * @param {String}
 *          sName
 * @param {Array}
 *          aSceneValues
 * @param {array}
 *          aCss
 */
function SceneButton (ParentDiv, sName, aSceneValues, aCss)
{
  var Div = document.createElement("input");
  Div.type = "button";
  Div.value = sName;
  Div.className = "ClassSceneButton";
  ApplyCss(Div, aCss);
  Div.style.position = "absolute";
  ParentDiv.appendChild(Div);
  this.m_Div = Div;
  this.m_aSceneValues = aSceneValues;

  Div.onclick = Vizab_OnClick;
  Div.onmousedown = Vizab_OnMouseDown;
  Div.oObject = this;
}

/*******************************************************************************
 * @param {Event}
 *          Event
 * @returns {boolean}
 */
SceneButton.prototype.OnClick = function TextValue_OnClick (Event)
{
  for (var Index in this.m_aSceneValues)
  {
    var oSceneValue = this.m_aSceneValues[Index];
    oSceneValue.m_oValue.SetValue(oSceneValue.m_sValue);
  }
  return (true);
};


// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------

/*******************************************************************************
 * @constructor
 * @param {Element}
 *          ParentDiv
 * @param {BA30Value}
 *          oValue
 * @param {array}
 *          aCss
 */
function TextValue (ParentDiv, oOutValue, oInValue, aCss)
{
  var Div = document.createElement("input");
  Div.className = "ClassTextValue";
  Div.type = "text";
  Div.style.position = "absolute";
  ApplyCss(Div, aCss);
  ParentDiv.appendChild(Div);
  this.m_Div = Div;
  Div.onclick = Vizab_OnClick;
  Div.oObject = this;
  this.m_oOutValue = oOutValue;
  this.m_oInValue = oInValue;
  this.m_bReadOnly = true;
  oOutValue.Register(this);
}

/*******************************************************************************
 * @param {BA30Value}
 *          oValue
 * @returns {boolean}
 */
TextValue.prototype.OnValueChanged = function OnValueChanged (oValue)
{
  var sValue = oValue.GetValue();
  var sAtt = this.m_sUnit;
  this.m_Div.value = (sValue || IsFinite(sValue)) ? (sValue + (sAtt ? " " + sAtt : "")) : "???";
  return (true);
};

/*******************************************************************************
 * @param {Event}
 *          Event
 * @returns {boolean}
 */
TextValue.prototype.OnClick = function TextValue_OnClick (Event)
{
  if (this.m_bReadOnly)
  {
    return (false);
  }
  var sValue = prompt("Enter new value (on|off|50%):", "");
  if (sValue !== "")
  {
    this.m_oInValue.SetValue(sValue);
  }
  return (true);
};

// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------

/*******************************************************************************
 * @param {Element}
 *          Div
 * @param {array}
 *          aCss
 * @returns {boolean}
 */
function ApplyCss (Div, aCss)
{
  for ( var Index in aCss)
  {
    Div.style[Index] = aCss[Index];
  }
}

/*******************************************************************************
 * @param {Event}
 *          e
 * @returns {boolean}
 */
function Vizab_OnReadyStateChange (e)
{
  var oObj = this.m_oObj;
  if (oObj && oObj.OnReadyStateChanged)
  {
    oObj.OnReadyStateChanged();
  }
}

/*******************************************************************************
 * @param {Event}
 *          e
 * @returns {boolean}
 */
function Vizab_OnFailed (e)
{
  var oObj = this.m_oObj;
  if (oObj && oObj.OnFailed)
  {
    oObj.OnFailed();
  }
}

/*******************************************************************************
 * @param {Event}
 *          e
 * @returns {boolean}
 */
function Vizab_OnMouseDown (e)
{
  var oObject = e.currentTarget.oObject;
  if (oObject && oObject.OnMouseDown)
  {
    oObject.OnMouseDown(e);
  }
  return (false);
}

/*******************************************************************************
 * @param {Event}
 *          e
 * @returns {boolean}
 */
function Vizab_OnClick (e)
{
  var oObject = e.currentTarget.oObject;
  if (oObject && oObject.OnClick)
  {
    oObject.OnClick(e);
  }
  return (false);
}

/*******************************************************************************
 * @param {Event}
 *          e
 * @returns {boolean}
 */
function Vizab_OnLoad (e)
{
  var oObject = e.currentTarget.oObject;
  if (oObject && oObject.OnLoad)
  {
    oObject.OnLoad(e);
  }
  return (false);
}

/*******************************************************************************
 * @param {Element}
 *          Div
 * @param {Object}
 *          oVizu
 * @param {FHEM}
 *          oFHEM
 * @returns {boolean}
 */
function InitVizu (Div, oVizu, oFHEM)
{
  for ( var Index in oVizu)
  {
    var VizWidget = oVizu[Index];
    var oValue = null;
    if (VizWidget.sValue)
    {
      oOutValue = oFHEM.GetValue(VizWidget.sValue.replace(/\*/g, "out"));
      oInValue = oFHEM.GetValue(VizWidget.sValue.replace(/\*/g, "in"));
    }
    var aValues = [];
    if (VizWidget.aValues)
    {
      for (var Index in VizWidget.aValues)
      {
        var ValuePair = VizWidget.aValues[Index];
        aValues.push({m_oValue : oFHEM.GetValue(ValuePair[0]), m_sValue : ValuePair[1]});
      }
    }
    var sName = VizWidget.sName ? VizWidget.sName : "";

    var Button;

    switch (VizWidget.sType)
    {
    case "SceneButton":
      Button = new SceneButton(Div, sName, aValues, VizWidget.aCss);
      Button.m_bDimmable = false;
      break;
    case "LampButton":
      Button = new LampButton(Div, oOutValue, oInValue, VizWidget.aCss, VizWidget.sPrefix, VizWidget.sExtension);
      Button.m_bDimmable = (VizWidget.bDimmable == true);
      break;
    case "TextValue":
      Button = new TextValue(Div, oOutValue, oInValue, VizWidget.aCss);
      Button.m_bReadOnly = (VizWidget.bReadOnly == true);
      Button.m_sUnit = VizWidget.sUnit ? VizWidget.sUnit : "";
      break;
    }
  }
  return (true);
}
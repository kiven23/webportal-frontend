import numpy as np
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
import re
import base64
import re
from collections import defaultdict
from PIL import Image
from pytesseract import pytesseract
import pythoncom
import win32com.client
import json
import pyodbc
import pymysql
import pymssql

global docentry;
import pywintypes
from datetime import datetime
import hashlib


@api_view(['GET'])
@renderer_classes([JSONRenderer])
def index(request):
    # POSSIBLE SAP CONNECTION
    conn = connect("ReportsFinance", 0, "192.168.1.13").GetBusinessObject("4")
    print(dir(conn))
    if conn == 0:
        print("Connection successful!")
    else:
        print(f"Connection failed with error code: {conn}")
    return Response("Welcome To SAP API powered by Python Django 4.0 192.168.1.26")


def selfdatabase():
    return 'production_backup'


def odbc(database, ip):
    conn = pymssql.connect(
        server=ip,
        user='sapprog105',
        password='105*Prog',
        database=database
    )

    return conn


@api_view(['GET'])
@renderer_classes([JSONRenderer])
def progress(request):
    identify = request.query_params.get('data', None)
    connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                 database=f'{selfdatabase()}')
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM serial WHERE mapid = '{identify}'")
    row = cursor.fetchone()
    if row:
        val = row[1]
    else:
        val = "No match"
    connection.close()
    return Response(val)


def connect(database, password, xip):
    pythoncom.CoInitialize()
    company = win32com.client.Dispatch("SAPbobsCOM.Company")
    company.Server = xip
    company.LicenseServer = "192.168.1.4:30001"
    company.DbUserName = "sapprog105"
    company.DbPassword = "105*Prog"
    company.CompanyDB = database
    company.UserName = sapaccount(password)['username']
    company.Password = sapaccount(password)['password']
    company.DbServerType = "6"
    conn = company.Connect()
    return company


def sapaccount(level):
    if level == 1:
        account = {'username': 'purch04', 'password': 'pUrch*04'}
        return account
    elif level == 2:
        account = {'username': 'purch02', 'password': 'puRch@02'}
        return account
    elif level == 3:
        account = {'username': 'purch01', 'password': 'purCh_01'}
        return account
    elif level == 5:
        account = {'username': 'manager', 'password': '123#qweQ'}
        return account
    else:
        account = {'username': 'sapadmin', 'password': '123!qweQ'}
        return account


# L@lic0n_15

@api_view(['POST'])
@renderer_classes([JSONRenderer])
def additem(request):
    try:

        get = request.data
        # Grouping data by fromMWH
        grouped_data = defaultdict(list)

        for item in get['data']:
            grouped_data[item['fromMWH']].append(item)

        # Convert grouped data into an indexed dictionary
        indexed_grouped_data = {index: values for index, values in enumerate(grouped_data.values())}

        msg = []
        for value in indexed_grouped_data.items():
            msg.append(createInvetory(get, value[1]))

        print(msg)

        return Response(msg)

    except Exception as e:
        return Response(str(e))
    finally:

        pythoncom.CoUninitialize()


def createInvetory(get, data):
    company = connect(get["db"]['dbname'], 0, get["db"]['dbserver'])
    oStockTransfer = company.GetBusinessObject("67")
    for index, value in enumerate(data):

        serialn = value["myserialnumber"]
        print(serialn)

        fromMWH = value["fromMWH"]
        toMWH = value["toMWH"]
        # DocumentDate = value["DocumentDate"]
        MyItemCode = value["MyItemCode"]
        Quantity = value["Quantity"]
        Model = value["Model"]
        Remarks = value["Remarks"]
        JrnlMemo = value["JrnlMemo"]

        # FROMWAREHOUSE

        oStockTransfer.FromWarehouse = fromMWH
        oStockTransfer.Comments = Remarks
        oStockTransfer.JournalMemo = JrnlMemo
        oStockTransfer.UserFields.Fields.Item("U_ClosedType").Value = value["U_CloseType"]
        oStockTransfer.UserFields.Fields.Item("U_Name").Value = value["U_Name"]
        oStockTransfer.UserFields.Fields.Item("U_StockTransType").Value = value["U_StockTransType"]
        # oStockTransfer.DocDate = DocumentDate
        # TOWAREHOUSE
        oStockTransfer.Lines.SetCurrentLine(index)
        oStockTransfer.Lines.WarehouseCode = toMWH
        oStockTransfer.Lines.ItemCode = MyItemCode
        oStockTransfer.Lines.ItemDescription = Model
        oStockTransfer.Lines.Quantity = Quantity
        # SETSERIALNUMBER TO TRANSFER

        for index, value in enumerate(serialn):
            print(index)
            oStockTransfer.Lines.SerialNumbers.SetCurrentLine(index)
            oStockTransfer.Lines.SerialNumbers.InternalSerialNumber = value
            oStockTransfer.Lines.SerialNumbers.Quantity = 1
            oStockTransfer.Lines.SerialNumbers.Add()
        oStockTransfer.Lines.Add()

    if oStockTransfer.Add() != 0:
        msg = {
            "message": f"Failed to add document. Error code: {company.GetLastErrorCode()}, Error Description: {company.GetLastErrorDescription()}",
            "status": "warning"}
    else:
        msg = {
            "message": f"#{company.GetNewObjectKey()}  - Inventory Tranfer Created..!", "status": "success"}

    return msg


def getdocentry(systemID):
    try:
        connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                     database=f'{selfdatabase()}')
        cursor = connection.cursor()
        # Check if the record exists
        select_query = f"SELECT * FROM serial WHERE mapid = '{systemID}'"
        cursor.execute(select_query)
        result = cursor.fetchone()
        return result
    except pymysql.MySQLError as e:
        print(f"An error occurred: {e}")
        return None
    except Exception as e:
        # Handle other unexpected errors
        print(f"An error occurred: {e}")
        return None
    finally:
        # Close the cursor and connection to ensure there are no open connections
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def updateProgress(systemID, progress, po, docentry, frontendline, actualline, qty):
    connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                 database=f'{selfdatabase()}')
    cursor = connection.cursor()
    print(systemID)
    # Check if the record exists
    select_query = f"SELECT * FROM serial WHERE mapid = '{systemID}'"
    cursor.execute(select_query)
    result = cursor.fetchone()

    if result is None:
        # Record does not exist, perform an INSERT operation
        insert_query = f"INSERT INTO serial (mapid, progress, po, docentry, frontendline, actualline, qty) VALUES ('{systemID}', '{progress}', '{po}', '{docentry}', '{frontendline}', '{actualline}', '{qty}')"
        cursor.execute(insert_query)
        connection.commit()
    else:
        # Record exists, perform an UPDATE operation
        update_query = f"UPDATE serial SET progress = '{progress}',serialized='true' WHERE mapid = '{systemID}'"
        cursor.execute(update_query)
        connection.commit()
        update_query = f"UPDATE po SET status = '1' WHERE mapid = '{systemID}'"
        cursor.execute(update_query)
        connection.commit()

    cursor.close()
    connection.close()
    return Response("success")


def toAutoSn(itemcode, db, ip, i):
    try:
        # Establish connection to SAP
        company = connect(db, 1, ip)
        if not company.Connected:
            raise Exception("Failed to connect to the SAP database.")

        # Get Items business object
        items = company.GetBusinessObject(4)  # 4 corresponds to Items object
        if not items.GetByKey(itemcode):
            raise Exception(f"Item with code {itemcode} not found.")

        # Log current values
        print(f"ItemCode: {items.ItemCode}")
        print(f"ItemName: {items.ItemName}")
        print(f"SRIAndBatchManageMethod: {items.SRIAndBatchManageMethod}")

        # Update serial number settings
        items.SRIAndBatchManageMethod = i
        items.AutoCreateSerialNumbersOnRelease = i

        # Update the item and handle errors
        if items.Update() != 0:
            err_code, err_msg = company.GetLastError()
            raise Exception(f"Error {err_code}: {err_msg}")

        print("Updated to autoupdate successfully.")
        return True

    except Exception as e:
        print(f"Error: {e}")
        return False


def getQty(line, listline):
    v = None  # Initialize v to None or a default value

    try:
        for data in listline:
            d1 = int(data['LineNum'])  # Convert LineNum to integer
            d2 = int(line)  # Convert line to integer
            if d1 == d2:
                v = data['qty']  # Assign qty to v if LineNum matches
                break  # Exit the loop once a match is found

    except (ValueError, KeyError) as e:
        # Handle specific exceptions
        print(f"An error occurred: {e}")
        # You can also log the error or handle it as needed

    return v


def updateinfo(po, qty, lines, remarks, vendorref):
    try:
        connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                     database=f'{selfdatabase()}')
        cursor = connection.cursor()
        # Check if the record exists
        mapID = f"{po}-{qty}-{lines}"
        select_query = f"SELECT * FROM tempinfo WHERE map = '{mapID}'"
        cursor.execute(select_query)
        result = cursor.fetchone()

        if result is None:
            # Record does not exist, perform an INSERT operation
            insert_query = f"INSERT INTO tempinfo (map, vendorref, remarks) VALUES ('{mapID}', '{vendorref}', '{remarks}')"
            cursor.execute(insert_query)
            connection.commit()
        else:
            # Record exists, perform an UPDATE operation
            update_query = f"UPDATE tempinfo SET vendorref = '{vendorref}', remarks = '{remarks}' WHERE map = '{mapID}'"
            cursor.execute(update_query)
            connection.commit()
        cursor.close()
        connection.close()
        return Response("success")
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def updateLines(po, qty, lines, sn, sni, brand, model, frontid):
    try:
        connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                     database=f'{selfdatabase()}')
        cursor = connection.cursor()
        mapID = f"{po}-{int(float(qty))}-{frontid}"
        print(mapID)
        if sn:
            update_query = f"UPDATE mapline SET `sn` = '{sn}', `brand` = '{brand}', `model` = '{model}' WHERE `mapline` = '{mapID}' AND `lines` = '{sni}'"
            cursor.execute(update_query)
            connection.commit()

        cursor.close()
        connection.close()
        return Response("success")
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def genLines(po, qty, lines, sn):
    try:
        connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                     database=f'{selfdatabase()}')
        cursor = connection.cursor()
        # Check if the record exists
        mapID = f"{po}-{int(float(qty))}-{lines}"
        select_query = f"SELECT * FROM linechecker WHERE map = '{mapID}'"
        cursor.execute(select_query)
        result = cursor.fetchone()

        if result is None:
            # Record does not exist, perform an INSERT operation
            insert_query = f"INSERT INTO linechecker (`po`, `qty`, `lines`, `map`) VALUES ('{po}', '{int(float(qty))}', '{lines}', '{mapID}')"
            cursor.execute(insert_query)
            for linenum in range(int(float(qty))):
                maplines = f"INSERT INTO mapline (`mapline`, `lines`) VALUES ('{mapID}', '{linenum}')"
                cursor.execute(maplines)
            connection.commit()
        else:
            # Record exists, perform an UPDATE operation
            # update_query = f"UPDATE mapline SET `sn` = '{sn}' WHERE `mapline` = '{mapID}' AND `lines` = '{lines}'"
            # cursor.execute(update_query)
            # connection.commit()

            cursor.close()
            connection.close()
            return Response("success")
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def createGrpoLogs(id, data):
    try:
        connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                     database=f'{selfdatabase()}')
        cursor = connection.cursor()
        select_query = f"SELECT * FROM grpologs WHERE mapid = '{id}'"
        cursor.execute(select_query)
        result = cursor.fetchone()
        if result is None:
            insert_query = f"INSERT INTO grpologs (mapid, logs) VALUES ('{id}', '{data}')"
            cursor.execute(insert_query)
            connection.commit()
        else:
            update_query = f"UPDATE grpologs SET logs = CONCAT(logs, ', {data}') WHERE mapid = '{id}'"
            cursor.execute(update_query)
            connection.commit()
        cursor.close()
        connection.close()
        return Response("success")
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def checkItemBeforeSerialized(itemcode, database, ip):
    try:
        # Establish connection
        connection = odbc(database, ip)
        cursor = connection.cursor()

        # Query with corrected syntax
        select_query = f"SELECT ItemCode FROM OITM WHERE ItemCode = '{itemcode}' AND ManOutOnly = 'N' AND validFor = 'Y' AND frozenFor = 'N'"
        cursor.execute(select_query)
        result = cursor.fetchone()[0]

        # Check if result is not None
        if result:
            return True
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        # Ensure the connection is closed
        if 'connection' in locals() and connection:
            connection.close()


@api_view(['POST'])
@renderer_classes([JSONRenderer])
def grpodoc(request):
    try:
        # GET DATE NNOW
        global whs
        global podate
        current_date = datetime.now()
        print(1)
        # Format the current date as 'YYYY-MM-DD'
        formatted_date = current_date.strftime('%Y-%m-%d')
        # CONNECTED DATABASE
        db = request.data['db']
        ip = request.data['ip']

        # END CONNECTED DATABASE
        get = request.data['data']
        data = base64.b64decode((get['hash']))
        json_str = data.decode('utf-8')
        information = json.loads(json_str)

        line = get['line']
        counting = len(line)
        prog = 100 / counting
        po = information[0]['DocEntry']
        print(po)
        print(information)
        company = connect(db, 0, ip)

        createGrpoLogs(get['logsID'], f"Server 26 Function Executed Please wait")
        # NEED CREATION OF SERIAL FIRST BEFORE INSERT
        poDocument = company.GetBusinessObject(22)

        grpoDocument = company.GetBusinessObject(20)
        recordset = company.GetBusinessObject(300)  # Recordset object
        if poDocument.GetByKey(po):  # Integer, not string
            print("Document Found!")
        else:
            print("Document Not Found!")
        # NEW QUERY CODE
        query = f"""
               SELECT T0.DocEntry, T0.CardCode, T1.ItemCode, T1.Dscription, 
                      T1.Quantity, T1.Price, T1.LineNum, T1.WhsCode, T1.LineStatus,
                      T0.DocDueDate 
               FROM OPOR T0
               INNER JOIN POR1 T1 ON T0.DocEntry = T1.DocEntry
               WHERE T0.DocEntry = {po} 
           """
        recordset.DoQuery(query)
        # END NEW QUERY

        # createGrpoLogs(get['logsID'], formatted_date)
        # createGrpoLogs(get['logsID'], poDocument.DocDueDate)
        # createGrpoLogs(get['logsID'], poDocument.Lines.WarehouseCode)

        date_pywintypes = pywintypes.Time(recordset.Fields.Item("DocDueDate").Value)
        date_obj = datetime(
            year=date_pywintypes.year,
            month=date_pywintypes.month,
            day=date_pywintypes.day
        )
        print(3)
        print(poDocument.CardCode)
        formatted_date_str = f"{po}    -{date_obj.strftime('%m/%d/%Y')}"
        podate = formatted_date_str
        grpoDocument.CardCode = recordset.Fields.Item("CardCode").Value
        grpoDocument.DocDate = formatted_date
        grpoDocument.DocDueDate = formatted_date;
        grpoDocument.PaymentGroupCode = -1;
        print(4)

        # MODEFIED CODE ===========================================================>>>>>

        for data in information:
            item_code = data['ItemCode']
            if checkItemBeforeSerialized(item_code, db, ip):
                toAutoSn(item_code, db, ip, 1)

            # createGrpoLogs(get['logsID'], item_code)
            # print(1)
            item_desc = data['Dscription']
            warehouse_code = data['WhsCode']

            print(warehouse_code)

            # quantity = recordset.Fields.Item("Quantity").Value

            grpoDocument.Series = getSeries(warehouse_code, db, ip)

            print(item_code)
            print(warehouse_code)
            print(item_desc)
            # (getQty(linenum, information))
            # Log and populate GRPO line
            createGrpoLogs(get['logsID'], f"Processing Line {data['LineNum']}")
            grpoDocument.Lines.ItemCode = item_code
            grpoDocument.Lines.ItemDescription = item_desc
            createGrpoLogs(get['logsID'], f"{item_desc}")
            grpoDocument.Lines.BaseType = 22  # Purchase Order
            grpoDocument.Lines.BaseEntry = po
            grpoDocument.Lines.BaseLine = data['LineNum']
            print(data['LineNum'])
            print('baka sa formatted date bro steve')
            grpoDocument.Lines.ShipDate = formatted_date
            print('hindi pala diyan steve pero check natin')
            print('baka sa quantity')
            grpoDocument.Lines.Quantity = data['qty']
            print('ay hindi pala')
            grpoDocument.Lines.Price = data['Price']
            print('Hindi sa price')
            grpoDocument.Lines.WarehouseCode = warehouse_code
            print('after warehouse')
            print(podate)
            try:
                print("bago Lines")
                filed = grpoDocument.Lines
                filed.UserFields.Fields.Item("U_PONo").Value = podate
                print("Assigned value to header-level U_PONo")
            except Exception as e:
                print(f"Error at header-level field assignment: {e}")

            print('baka sa warehouse grpo log')
            createGrpoLogs(get['logsID'], f"{warehouse_code}")
            print('dito talaga steven nag kakaerror malapit sa genline')
            genLines(po, getQty(data['LineNum'], information), data['LineNum'], 0)
            print('hindi sa genline pala kasi linampasan niya baka sa adding')
            grpoDocument.Lines.Add()

        # ENDMODEFIED CODE==========================================================>>>>>

        # for linenum in line:
        # poDocument.Lines.SetCurrentLine(linenum)
        # createGrpoLogs(get['logsID'], linenum)
        # print(5)
        # if poDocument.Lines.LineStatus == 1:  # BoStatus.bost_Close
        # createGrpoLogs(get['logsID'], f"Line {line} is closed.")
        # createGrpoLogs(get['logsID'], poDocument.Lines.ItemCode)
        # print(6)
        # else:
        # print(7)
        # toAutoSn(poDocument.Lines.ItemCode, db, ip)
        # print('sa auto')
        # createGrpoLogs(get['logsID'], poDocument.Lines.ItemCode)
        # print('createGrpoLogs')
        # createGrpoLogs(get['logsID'], poDocument.Lines.WarehouseCode)
        # createGrpoLogs(get['logsID'], poDocument.Lines.ItemDescription)
        # print('getSeries bago')
        # print(poDocument.Lines.WarehouseCode)
        # grpoDocument.Series = getSeries(poDocument.Lines.WarehouseCode, db, ip)
        # print('getSeries')
        # grpoDocument.Lines.ItemCode = poDocument.Lines.ItemCode
        # grpoDocument.Lines.ItemDescription = poDocument.Lines.ItemDescription
        # grpoDocument.Lines.BaseType = 22  # Purchase order
        # grpoDocument.Lines.BaseEntry = poDocument.DocEntry
        # grpoDocument.Lines.BaseLine = poDocument.Lines.LineNum
        # grpoDocument.Lines.ShipDate = poDocument.Lines.ShipDate
        # grpoDocument.Lines.Quantity = getQty(linenum, information)
        # grpoDocument.Lines.Price = poDocument.Lines.Price
        # grpoDocument.Lines.WarehouseCode = poDocument.Lines.WarehouseCode
        # genLines(po, getQty(linenum, information), linenum, 0)
        # grpoDocument.Lines.UserFields.Fields.Item("U_PONo").Value = podate
        # grpoDocument.Lines.Add()

        createGrpoLogs(get['logsID'], "add na")
        print(8)
        addStatus = grpoDocument.Add()
        createGrpoLogs(get['logsID'], "adding grpo")
        if addStatus == 0:
            # print("Document added successfully.")
            createGrpoLogs(get['logsID'], "Document added successfully.")

            print(9)
            newDocEntry = company.GetNewObjectKey()
            for index, line in enumerate(information):
                docentry = line['DocEntry']
                itemcode = line['ItemCode']
                openQty = line['OpenQty']  # This will be a string, e.g., '2.000000'

                # Convert openQty to an integer and then to a string for concatenation
                systemID = newDocEntry + docentry + itemcode + str(line['LineNum']) + str(
                    int(float(openQty)))  # Ensure openQty is treated as a float first
                # print(10)
                # Store the line number separately
                line_num = line['LineNum']
                # createGrpoLogs(get['logsID'], line['LineNum'])
                # print(systemID)  # Print the constructed systemID
                frontendline = line_num  # This now holds the line number
                actualline = index  # This stores the current index
                # print(newDocEntry)
                # Ensure that `po`, `newDocEntry`, and `getQty` are defined correctly
                updateProgress(systemID, 0, po, newDocEntry, frontendline, actualline, getQty(line_num, information))
                poreplica(line, systemID)
                toAutoSn(itemcode, db, ip, 0)
                # print("creating serial")
                # createGrpoLogs(get['logsID'], "creating serial")
            message = {"message": f"{newDocEntry} has been created successfully! "
                                  "The GRPO was created without serial numbers. "
                                  "Please add the serial numbers manually and proceed to the next step.",
                       "status": "success"}
            createGrpoLogs(get['logsID'], f"{newDocEntry} has been created successfully!")
        else:

            message = {
                "message": f"Failed to add document. Error code: {company.GetLastErrorCode()}, Error Description: {company.GetLastErrorDescription()}",
                "status": "warning"}
            # print(
            # f"Failed to add document. Error code: {company.GetLastErrorCode()}, Error Description: {company.GetLastErrorDescription()}")

        # print("ok")
        # createGrpoLogs(get['logsID'], "ok")

        return Response(message)
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        if company.Connected:
            company.Disconnect()
    finally:
        if company.Connected:
            company.Disconnect()


def poreplica(po, systemID):
    # Database connection
    connection = pymysql.connect(
        host='192.168.1.3',
        port=3306,
        user='stevefox',
        password='M15@2dwin0n7y',
        database=f'{selfdatabase()}'
    )

    try:
        # Create a cursor object
        cursor = connection.cursor()

        # Prepare the INSERT query
        insert_query = f"""
           INSERT INTO po (DocEntry, LineNum, TargetType, TrgetEntry, BaseRef, BaseType, BaseEntry, BaseLine, 
                           LineStatus, ItemCode, Dscription, Quantity, ShipDate, OpenQty, Price, Currency, 
                           Rate, DiscPrcnt, LineTotal, TotalFrgn, OpenSum, OpenSumFC, VendorNum, SerialNum, 
                           WhsCode, SlpCode, Commission, TreeType, AcctCode, TaxStatus, GrossBuyPr, 
                           PriceBefDi, DocDate, Flags, OpenCreQty, UseBaseUn, SubCatNum, BaseCard, 
                           TotalSumSy, OpenSumSys, InvntSttus, OcrCode, Project, CodeBars, VatPrcnt, 
                           VatGroup, PriceAfVAT, Height1, FirmName,status,mapid)
           VALUES ('{po['DocEntry']}', '{po['LineNum']}', '{po['TargetType']}', '{po['TrgetEntry']}', 
                   '{po['BaseRef']}', '{po['BaseType']}', '{po['BaseEntry']}', '{po['BaseLine']}', '{po['LineStatus']}', 
                   '{po['ItemCode']}', '{po['Dscription']}', '{po['qty']}', '{po['ShipDate']}', '{po['OpenQty']}', 
                   '{po['Price']}', '{po['Currency']}', '{po['Rate']}', '{po['DiscPrcnt']}', '{po['LineTotal']}', 
                   '{po['TotalFrgn']}', '{po['OpenSum']}', '{po['OpenSumFC']}', '{po['VendorNum']}', '{po['SerialNum']}', 
                   '{po['WhsCode']}', '{po['SlpCode']}', '{po['Commission']}', '{po['TreeType']}', '{po['AcctCode']}', 
                   '{po['TaxStatus']}', '{po['GrossBuyPr']}', '{po['PriceBefDi']}', '{po['DocDate']}', '{po['Flags']}', 
                   '{po['OpenCreQty']}', '{po['UseBaseUn']}', '{po['SubCatNum']}', '{po['BaseCard']}', '{po['TotalSumSy']}', 
                   '{po['OpenSumSys']}', '{po['InvntSttus']}', '{po['OcrCode']}', '{po['Project']}', '{po['CodeBars']}', 
                   '{po['VatPrcnt']}', '{po['VatGroup']}', '{po['PriceAfVAT']}', '{po['Height1']}', '{po['FirmName']}',0,'{systemID}');
           """
        # Execute the insert query
        cursor.execute(insert_query)

        # Commit the transaction
        connection.commit()


    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        # Close the cursor and connection
        cursor.close()
        connection.close()


def objectcode(serial, line, po, qty, systemID, remarks, vendorref, db, ip, itemcode, brand, model):
    try:
        prog = 100 / qty
        company = connect(db, 0, ip)
        lines = getdocentry(systemID)[6]

        msg = serialSn(getdocentry(systemID)[4], serial, company, prog, po, systemID,
                       newmapdocentry(getdocentry(systemID)[4], itemcode, db, ip, line), lines, remarks, vendorref, db,
                       ip, brand, model, line)
        an_response = msg
        print("ok")
        return Response(an_response)
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def newmapdocentry(systemID, itemcode, db, ip, line):
    try:
        connection = odbc(db, ip)
        print(systemID, itemcode, db, ip)
        cursor = connection.cursor()
        select_query = f"SELECT LineNum FROM pdn1 WHERE DocEntry = '{systemID}' and ItemCode = '{itemcode}' and BaseLine = '{line}'"
        cursor.execute(select_query)
        result = cursor.fetchone()[0]
        return result
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def checksystemID(systemID):
    try:
        connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                     database=f'{selfdatabase()}')
        cursor = connection.cursor()
        # Check if the record exists
        select_query = f"SELECT * FROM grpostatus WHERE systemid = '{systemID}'"
        cursor.execute(select_query)
        result = cursor.fetchone()
        if result:
            # Access the specific column index; adjust as needed
            return result[2]
        else:
            return "false"
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def createsystemID(systemID):
    try:
        connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                     database=f'{selfdatabase()}')
        cursor = connection.cursor()
        insert_query = f"INSERT INTO grpostatus (systemid, status) VALUES ('{systemID}', 'true')"
        cursor.execute(insert_query)
        connection.commit()
        return "ok"
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def serialSn(doc, serialnumber, company, prog, po, systemID, line, frontendlines, remarks, vendorref, db, ip, brand,
             model, frontid):
    try:
        print(checksystemID(systemID))
        print(systemID)
        print(doc)
        print(line)

        # if checksystemID(systemID) == 'true':
        #     message = {"message": f"{doc} Already exist", "status": "warning"}
        # else:
        # STEVEFOX_LINUX

        updatedserial = company.GetBusinessObject(20)

        if updatedserial.GetByKey(doc):
            if (updatedserial.Comments != ''):
                updatedserial.Comments = f" {remarks} Based On Purchase Orders {po}"

            updatedserial.NumAtCard = vendorref
            print(line)

            updatedserial.Lines.SetCurrentLine(line)

            print(updatedserial.Lines.Quantity)

            updateinfo(po, int(float(updatedserial.Lines.Quantity)), frontendlines, remarks, vendorref)
            for i in range(int(updatedserial.Lines.Quantity)):
                updatedserial.Lines.SerialNumbers.SetCurrentLine(i)
                print(i)
                print(updatedserial.Lines.ItemCode)
                updateserial = {'itemcode': updatedserial.Lines.ItemCode,
                                'systemserial': updatedserial.Lines.SerialNumbers.SystemSerialNumber,
                                'newserial': mapitemquantity(i, serialnumber)}
                StoreProcedureSerial(updateserial, db, ip)
                print(po, int(float(updatedserial.Lines.Quantity)), frontendlines, mapitemquantity(i, serialnumber), i)
                updateLines(po, updatedserial.Lines.Quantity, frontendlines, mapitemquantity(i, serialnumber), i, brand,
                            model, frontid)
                actual = i + 1
                print(f"progress - {prog * actual}")
                updateProgress(systemID, prog * actual, po, doc, 0, 0, 0)
        updatedserial.Update()
        createsystemID(systemID)
        message = {"message": f"Doc {po} serial created", "status": "success"}
        return message
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def mapitemquantity(i, serial_list):
    try:
        for item in serial_list:
            if item.get('index') == i:
                return item.get('sn')
        return None
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def registrationStored(db, ip):
    connection = odbc(db, ip)
    cursor = connection.cursor()
    cursor.execute("""
                    CREATE PROCEDURE UpdateDistNumber
                        @ItemCode NVARCHAR(20),
                        @SysNumber INT,
                        @NewDistNumber NVARCHAR(50)
                    AS
                    BEGIN
                        SET NOCOUNT ON;
                        UPDATE OSRN
                        SET DistNumber = @NewDistNumber
                        WHERE ItemCode = @ItemCode AND SysNumber = @SysNumber;
                    END
                    """)
    # Commit the transaction to ensure the CREATE PROCEDURE command is executed
    connection.commit()
    # Close the cursor and connection
    cursor.close()


def getSeries(warehouse, db, ip):
    try:
        connection = odbc(db, ip)
        d = warehouse.split('-')
        whs = d[0]
        print(whs)
        # main
        mainwhs = ['ADMN', 'ADMN2', 'CAMA', 'ANON', 'MEXI']
        for whsdata in mainwhs:
            if whsdata == whs:
                print(598)
                if whs == 'MEXI':
                    print(11)
                    return 11
                else:
                    print(598)
                    return 598
        cursor = connection.cursor()
        select_query = f"SELECT Series FROM NNM1 WHERE ObjectCode = 20 and SeriesName = '{remapseries(whs, db, ip)}'"
        cursor.execute(select_query)
        result = cursor.fetchone()[0]
        return result
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def remapseries(series, db, ip):
    try:
        connection = odbc(db, ip)
        cursor = connection.cursor()
        select_query = f"SELECT U_Series1 FROM dbo.[@PROGTBL] WHERE U_WhseCode = '{series}'"
        cursor.execute(select_query)
        result = cursor.fetchone()[0]
        return result
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def StoreProcedureSerial(updateserial, db, ip):
    connection = odbc(db, ip)
    item_code = updateserial['itemcode']
    system_serial = updateserial['systemserial']
    new_serial = updateserial['newserial']
    print(updateserial['systemserial'])
    print(updateserial['newserial'])
    print(updateserial['itemcode'])
    cursor = connection.cursor()

    try:
        if new_serial is not None:
            # Using parameterized query to prevent SQL injection
            command = "EXEC UpdateDistNumber @ItemCode=%s, @SysNumber=%s, @NewDistNumber=%s;"
            cursor.execute(command, (item_code, system_serial, new_serial))
            # If you want to commit the changes, uncomment the following line
            connection.commit()
            print("Stored procedure executed successfully.")
            msg = f"{new_serial} - Stored procedure executed successfully."
        else:
            # Optionally handle the case when new_serial is None, if necessary
            msg = f"{new_serial} - NewDistNumber is None, skipping the update."
            print("NewDistNumber is None, skipping the update.")
    except pymssql.Error as e:
        # Print the details of the exception
        print(f"Error: {str(e)}")
        registrationStored(db, ip)
        msg = f"Error: {str(e)}"
    finally:
        connection.close()

    return msg
    # -- Check if the stored procedure exists
    # IF OBJECT_ID('UpdateDistNumber', 'P') IS NOT NULL
    # BEGIN
    #    -- Drop the existing stored procedure
    #    DROP PROCEDURE UpdateDistNumber;
    # END
    # GO

    # -- Create the updated stored procedure
    # CREATE PROCEDURE UpdateDistNumber
    #     @ItemCode NVARCHAR(20),
    #    @SysNumber INT,
    #    @NewDistNumber NVARCHAR(50)
    # AS
    # BEGIN
    #    SET NOCOUNT ON;
    #    UPDATE OSRN
    #    SET DistNumber = @NewDistNumber
    #   WHERE ItemCode = @ItemCode AND SysNumber = @SysNumber;
    #  END;


@api_view(['POST'])
@renderer_classes([JSONRenderer])
def grpobarcode(request):
    try:
        db = request.data['db']
        ip = request.data['ip']

        get = request.data['data']
        po = get['listing']['po']
        line = get['listing']['linenum']
        serial = get['serial']
        itemcode = get['listing']['itemcode']
        quantity = float(get['listing']['quantity'])
        systemID = get['listing']['uniqueid']
        vendorref = get['vendorref']
        remarks = get['remarks']

        brand = get['listing']['brand']
        model = get['listing']['model']
        # output = []
        # for item in get['serial']:
        #     if(item['sn']):
        #      output.append(checksn(db, ip, model, item['sn']))

        output = []
        batch_size = 1000  # Pwedeng baguhin depende sa dami ng serials at database capacity

        # Split serials into batches
        # for i in range(0, len(get['serial']), batch_size):
        #     batch = get['serial'][i:i + batch_size]
        #     serials = [item['sn'] for item in batch if item['sn']]  # Kunin lang ang mga serial numbers
        #     found_serials = checksn_batch(db, ip, model, serials)
        #
        #     # Add found serials to output
        #     for item in batch:
        #         if item['sn'] in found_serials:
        #             output.append(item['sn'])
        # filtered_array = [item for item in output if item != ""]
        # print(filtered_array)
        # if(filtered_array):
        #    msg = ( f"We cannot proceed because the system is unable to accept one of the following serial numbers: {output}. This serial number already exists for this model.")
        #    return  Response({"message": f"{msg}", "status": "warning", "refresh": 0})
        # else:
        return objectcode(serial, line, po, quantity, systemID, remarks, vendorref, db, ip, itemcode, brand, model)
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def checksn_batch(db, ip, model, serials):
    try:
        connection = odbc(db, ip)
        cursor = connection.cursor()

        # Convert list of serials to a format suitable for SQL IN clause
        serials_placeholder = ', '.join(f"'{sn}'" for sn in serials)
        select_query = f"""
            SELECT IntrSerial AS sn
            FROM OSRI
            WHERE ItemName = '{model}' AND IntrSerial IN ({serials_placeholder})
        """
        cursor.execute(select_query)
        results = cursor.fetchall()

        # Extract serials from the result
        return {row[0] for row in results}
    except Exception as e:
        print(f"An error occurred: {e}")
        return set()


def checksn(db, ip, model, sn):
    try:
        connection = odbc(db, ip)
        cursor = connection.cursor()
        select_query = f"SELECT IntrSerial as sn FROM OSRI WHERE ItemName = '{model}' and IntrSerial = '{sn}'"
        cursor.execute(select_query)
        result = cursor.fetchone()
        print(result)
        if result:
            return result[0]
        else:
            return ""
    except Exception as e:
        # Handle any other exceptions
        print(f"An error occurred: {e}")
        return ""

    return result


@api_view(['POST'])
@renderer_classes([JSONRenderer])
def getkey(request):
    try:
        get = request.data['data']

        connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                     database=f'{selfdatabase()}')
        cursor = connection.cursor()
        # Check if the record exists
        select_query = f"SELECT * FROM serial WHERE po = '{get}'"
        cursor.execute(select_query)
        result = cursor.fetchall()
        return Response(result)
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def does_business_partner_exist(cardcode, company):
    BusinessPartner = company.GetBusinessObject("2")
    return BusinessPartner.GetByKey(cardcode)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
def businesspartner(request):
    getcode = request.data['data']
    database = request.data['db']
    Series = getcode["series"]
    CardType = getcode["cardtype"]
    CardName = getcode["name"]
    Cellular = getcode["mobile"]
    U_Bday = getcode["birthday"]
    GroupCode = getcode["group"]
    company = connect(database['dbname'], 0, database['dbserver'])
    BusinessPartner = company.GetBusinessObject("2")
    print("1")
    BusinessPartner.UserFields.Fields.Item("U_Bday").Value = U_Bday
    BusinessPartner.Series = Series
    BusinessPartner.CardType = 0 if CardType == 'C' else 1
    BusinessPartner.CardName = CardName
    BusinessPartner.Cellular = Cellular
    BusinessPartner.SalesPersonCode = getcode['salesemployee']

    BusinessPartner.HouseBank = getcode['bankname']
    BusinessPartner.HouseBankAccount = getcode['account']
    BusinessPartner.HouseBankBranch = getcode['branch']
    BusinessPartner.HouseBankCountry = 'PH'

    BusinessPartner.BilltoDefault = CardName
    BusinessPartner.BillToBuildingFloorRoom = f"{getcode['streetpobox']} ,{getcode['barangay']} , {getcode['city']} , PH, {getcode['areacode']}"
    BusinessPartner.Block = getcode['barangay']
    BusinessPartner.ZipCode = getcode['areacode']
    BusinessPartner.City = getcode['city']
    BusinessPartner.Address = getcode['streetpobox']
    BusinessPartner.PayTermsGrpCode = getcode['paymentterm']
    BusinessPartner.GroupCode = GroupCode
    # BusinessPartner.PriceListNum = getcode['pricelistdata']
    if does_business_partner_exist(getcode['cardcode'], company):
        return businesspartner_update(company, getcode)
    else:
        return businesspartner_save(BusinessPartner, company)


def businesspartner_save(BusinessPartner, company):
    if BusinessPartner.Add() != 0:
        msg = {
            "message": f"Failed to add document. Error code: {company.GetLastErrorCode()}, Error Description: {company.GetLastErrorDescription()}",
            "status": "warning"}
    else:
        msg = {
            "message": f"#{company.GetNewObjectKey()}  - Business Partner Created..!", "status": "success"}
    print(msg)
    return Response(msg)


def businesspartner_update(company, getcode):
    Series = getcode["series"]
    CardType = getcode["cardtype"]
    CardName = getcode["name"]
    Cellular = getcode["mobile"]
    U_Bday = getcode["birthday"]
    GroupCode = getcode["group"]
    BusinessPartner = company.GetBusinessObject("2")
    BusinessPartner.GetByKey(getcode['cardcode'])
    BusinessPartner.UserFields.Fields.Item("U_Bday").Value = U_Bday
    BusinessPartner.Series = Series
    BusinessPartner.CardType = 0 if CardType == 'C' else 1
    BusinessPartner.CardName = CardName
    BusinessPartner.Cellular = Cellular
    BusinessPartner.SalesPersonCode = getcode['salesemployee']
    BusinessPartner.HouseBank = getcode['bankname']
    BusinessPartner.HouseBankAccount = getcode['account']
    BusinessPartner.HouseBankBranch = getcode['branch']
    BusinessPartner.HouseBankCountry = 'PH'
    BusinessPartner.BilltoDefault = CardName
    BusinessPartner.BillToBuildingFloorRoom = f"{getcode['streetpobox']} ,{getcode['barangay']} , {getcode['city']} , PH, {getcode['areacode']}"
    BusinessPartner.Block = getcode['barangay']
    BusinessPartner.ZipCode = getcode['areacode']
    BusinessPartner.City = getcode['city']
    BusinessPartner.Address = getcode['streetpobox']
    BusinessPartner.PayTermsGrpCode = getcode['paymentterm']
    BusinessPartner.GroupCode = GroupCode
    if BusinessPartner.Update() != 0:
        msg = {
            "message": f"Failed to update document. Error code: {company.GetLastErrorCode()}, Error Description: {company.GetLastErrorDescription()}",
            "status": "warning"}
    else:
        msg = {
            "message": f"#{company.GetNewObjectKey()}  - Business Partner Update..!", "status": "success"}
    return Response(msg)


@api_view(['GET'])
@renderer_classes([JSONRenderer])
def getlines(request):
    data = request.query_params.get('data', None)

    connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                 database=f'{selfdatabase()}')
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM mapline WHERE mapline = '{data}'")
    row = cursor.fetchall()
    cursor.execute(f"SELECT * FROM tempinfo WHERE map = '{data}'")
    info = cursor.fetchone()
    data = {"sn": row, "info": info}
    return Response(data)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
def goodsissue(request):
    try:
        get = request.data
        company = connect(get["db"]['dbname'], 0, get["db"]['dbserver'])
        goodsissue = company.GetBusinessObject("60")
        # goodsissue.Series = 61
        for index, item in enumerate(get['data']):
            myserialnumber = item["myserialnumber"]
            warehouse = item["warehouse"]
            MyItemCode = item["MyItemCode"]
            Quantity = item["Quantity"]
            Model = item["Model"]
            GLacct = item["GL"]
            goodsissue.Comments = item["Remarks"]
            # WAREHOUSE
            goodsissue.Lines.SetCurrentLine(index)
            goodsissue.Lines.ItemCode = MyItemCode
            goodsissue.Lines.AccountCode = GLacct
            goodsissue.Lines.WarehouseCode = warehouse
            goodsissue.Lines.ItemDescription = Model
            goodsissue.Lines.Quantity = Quantity
            # SETSERIALNUMBER TO TRANSFER
            for index, value in enumerate(myserialnumber):
                goodsissue.Lines.SerialNumbers.SetCurrentLine(index)
                goodsissue.Lines.SerialNumbers.InternalSerialNumber = value
                goodsissue.Lines.SerialNumbers.Quantity = 1
                goodsissue.Lines.SerialNumbers.Add()
            print('padd na')
            goodsissue.Lines.Add()

        if goodsissue.Add() != 0:
            msg = {
                "message": f"Failed to add document. Error code: {company.GetLastErrorCode()}, Error Description: {company.GetLastErrorDescription()}",
                "status": "warning"}
        else:
            msg = {"message": f"GoodsIssue created successful #{company.GetNewObjectKey()}", "status": "success"}

        return Response(msg)

    except Exception as e:
        msg = {"message": f"{str(e)}", "status": "warning"}
        return Response(msg)
    finally:
        pythoncom.CoUninitialize()


@api_view(['POST'])
@renderer_classes([JSONRenderer])
def goodsreceipt(request):
    try:
        get = request.data
        company = connect(get["db"]['dbname'], 0, get["db"]['dbserver'])
        goodsissue = company.GetBusinessObject("59")
        for index, item in enumerate(get['data']):
            myserialnumber = item["myserialnumber"]
            warehouse = item["warehouse"]
            MyItemCode = item["MyItemCode"]
            Quantity = item["Quantity"]
            Model = item["Model"]
            GLacct = item["GL"]
            goodsissue.Comments = item["Remarks"]
            # WAREHOUSE
            goodsissue.Lines.SetCurrentLine(index)
            goodsissue.Lines.ItemCode = MyItemCode
            goodsissue.Lines.AccountCode = GLacct
            goodsissue.Lines.WarehouseCode = warehouse
            goodsissue.Lines.ItemDescription = Model
            goodsissue.Lines.Quantity = Quantity
            goodsissue.Lines.UnitPrice = 2
            # SETSERIALNUMBER TO TRANSFER
            print('dito')
            for i, value in enumerate(myserialnumber):
                print(i)
                goodsissue.Lines.SerialNumbers.SetCurrentLine(i)
                goodsissue.Lines.SerialNumbers.InternalSerialNumber = value
                goodsissue.Lines.SerialNumbers.Quantity = 1
                goodsissue.Lines.SerialNumbers.Add()
            print('padd na')
            goodsissue.Lines.Add()
        if goodsissue.Add() != 0:
            msg = {
                "message": f"Failed to add document. Error code: {company.GetLastErrorCode()}, Error Description: {company.GetLastErrorDescription()}",
                "status": "warning"}
        else:
            msg = {"message": f"GoodReceipt created successful #{company.GetNewObjectKey()}", "status": "success"}
        return Response(msg)
    except Exception as e:
        msg = {"message": f"{str(e)}", "status": "warning"}
        return Response(msg)
    finally:
        pythoncom.CoUninitialize()


@api_view(['GET'])
@renderer_classes([JSONRenderer])
def AllItemAutoSN(request):
    try:
        # get = request.data
        # for datas in get:
        #   toAutoSn(datas['item'], 'ReportsFinance', '192.168.1.13')

        connection = odbc('ADDESSA_NEWPROD', '192.168.1.15')

        cursor = connection.cursor()
        select_query = """
        SELECT TOP 1000 ItemCode
        FROM OITM
        WHERE ManOutOnly = 'Y'

        """
        cursor.execute(select_query)
        result = cursor.fetchall()
        # return Response({'message':result})
        item = []
        count = 0
        if result:
            for row in result:
                itemcode = row[0]
                item.append(itemcode)
                count = count + 1

            for itemcodes in item:
                toAutoSn(itemcodes, 'ADDESSA_NEWPROD', '192.168.1.15', 0)

        return Response({'message': count})

        return Response({'message': 'ok'})
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None


def removeAutosn(database, ip):
    try:
        connection = odbc('ADDESSA_NEWPROD', '192.168.1.15')
        cursor = connection.cursor()
        select_query = """
           SELECT TOP 1000 ItemCode
           FROM OITM
           WHERE ManOutOnly = 'Y'
           """
        cursor.execute(select_query)
        result = cursor.fetchall()
        return Response({'message': result})
        item = []
        count = 0
        if result:
            for row in result:
                itemcode = row[0]
                item.append(itemcode)
                count = count + 1
            for itemcodes in item:
                toAutoSn('ADDESSA_NEWPROD', '192.168.1.15', ip, 0)
        return 'ok'
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return None



#======AP CREDIT ====================================================#
@api_view(['POST'])
@renderer_classes([JSONRenderer])
def apcreditmemo(request):
    try:
        get = request.data
        dataItems = get['data'][0]
        company = connect(get["db"]['dbname'], 0, get["db"]['dbserver'])
        creditnote = company.GetBusinessObject("19")
        print(2)

        creditnote.CardCode = dataItems["CardCode"]
        print(3)
        creditnote.Series = getSeriesAPCM(get['series'],get["db"]['dbname'],get["db"]['dbserver'])
        print(4)
        creditnote.Comments = dataItems["Comments"]
        creditnote.UserFields.Fields.Item("U_TranCat").Value = dataItems["U_TranCat"]
        creditnote.UserFields.Fields.Item("U_StockTransType").Value = dataItems["U_StockTransType"]
        print(5)
        for i, lines in enumerate(dataItems["Lines"]):
            creditnote.Lines.SetCurrentLine(i)

            creditnote.Lines.ItemCode = lines["ItemCode"]
            creditnote.Lines.WTLiable = 1
            creditnote.Lines.UnitPrice = getUnitPrice(get["db"]['dbname'],get["db"]['dbserver'],lines["ItemCode"],lines["WarehouseCode"])
            creditnote.Lines.Quantity = lines["Quantity"]
            creditnote.Lines.WarehouseCode = lines["WarehouseCode"]
            print(7)
            for lineNum, sn in enumerate(lines["SerialNumbers"]):
                print(8)
                creditnote.Lines.SerialNumbers.SetCurrentLine(lineNum)
                creditnote.Lines.SerialNumbers.InternalSerialNumber = sn
                creditnote.Lines.SerialNumbers.Quantity = 1
                creditnote.Lines.SerialNumbers.Add()
            creditnote.Lines.Add()
        if creditnote.Add() !=0:
            msg = {
                "message": f"Failed to add document. Error code: {company.GetLastErrorCode()}, Error Description: {company.GetLastErrorDescription()}",
                "status": "warning"}
        else:
            getNewID = company.GetNewObjectKey()
            createApcmInternalRecords(dataItems, getNewID)
            msg = {"message": f"CreditNote created successful #{getNewID}", "status": "success"}


    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return Response(e)
    return Response(msg)
def getUnitPrice(db,ip,itemcode,warehouse):
    connection = odbc(db, ip)
    cursor = connection.cursor()
    select_query = f"SELECT T0.[AvgPrice] FROM OITW T0 WHERE T0.[ItemCode] ='{itemcode}' AND  T0.[WhsCode] ='{warehouse}'"
    cursor.execute(select_query)
    result = cursor.fetchone()[0]
    print(result)
    return result
def getSeriesAPCM(series,db, ip):
    connection = odbc(db, ip)
    cursor = connection.cursor()
    select_query = f"select series from NNM1 where ObjectCode = 19 and SeriesName = '{series}'"
    cursor.execute(select_query)
    result = cursor.fetchone()[0]
    print(result)
    return result
def createApcmInternalRecords(data,code):
    try:
        # Database Connection
        connection = pymysql.connect(
            host='192.168.1.3',
            port=3306,
            user='stevefox',
            password='M15@2dwin0n7y',
            database=selfdatabase()  # Assuming this function exists
        )
        cursor = connection.cursor()

        # Insert into `apcm_created`
        insertApcm = """
                INSERT INTO apcm_created (source_vendor, docnum_id, objectcode, to_vendor, status, to_database, from_database)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
        cursor.execute(insertApcm, (
            data['fromVendorName'], code, 18, data['toVendorName'], 0, '', ''
        ))

        # Insert into `apcm_items`
        insertItems = """
                INSERT INTO apcm_items (docnum_id, itemcode, quantity, towarehouse, serialnumbers)
                VALUES (%s, %s, %s, %s, %s)
            """
        for line in data['Lines']:
            cursor.execute(insertItems, (
                code,
                line['ItemCode'],
                line['Quantity'],
                data['toMWH'],
                json.dumps(line['SerialNumbers'])  # Convert list to JSON
            ))

        # Commit transaction
        connection.commit()
        return "ok"

    except Exception as e:
        connection.rollback()
        return f"Error: {e}"

    finally:
        # Close resources
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

@api_view(['POST'])
@renderer_classes([JSONRenderer])
def apinvoice(request):
    try:
        get = request.data
        print(1)
        company = connect('ReportsFinance', 0, '192.168.1.13')
        creditnote = company.GetBusinessObject("18")
        print(2)
        creditnote.CardCode = get["CardCode"]
        print(3)
        creditnote.Series = get["Series"]
        print(4)
        creditnote.Comments = get["Comments"]
        creditnote.UserFields.Fields.Item("U_TranCat").Value = get["U_TranCat"]
        creditnote.UserFields.Fields.Item("U_StockTransType").Value = get["U_StockTransType"]
        print(5)
        for i, lines in enumerate(get["Lines"]):
            creditnote.Lines.SetCurrentLine(i)

            creditnote.Lines.ItemCode = lines["ItemCode"]

            creditnote.Lines.WTLiable = lines["WTLiable"]
            creditnote.Lines.UnitPrice = "111"
            creditnote.Lines.Quantity = lines["Quantity"]
            creditnote.Lines.WarehouseCode = lines["WarehouseCode"]
            print(7)
            for lineNum, sn in enumerate(lines["SerialNumbers"]):
                print(8)
                creditnote.Lines.SerialNumbers.SetCurrentLine(lineNum)
                print(9)
                creditnote.Lines.SerialNumbers.InternalSerialNumber = sn
                print(10)
                creditnote.Lines.SerialNumbers.Quantity = 1
                print(11)
                creditnote.Lines.SerialNumbers.Add()
            creditnote.Lines.Add()
            print(12)
        if creditnote.Add() != 0:
            msg = {
                "message": f"Failed to add document. Error code: {company.GetLastErrorCode()}, Error Description: {company.GetLastErrorDescription()}",
                "status": "warning"}
        else:
            msg = {"message": f"AP-Invoice created successful #{company.GetNewObjectKey()}", "status": "success"}

    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")
        return Response(e)
    return Response(msg)



    ============================================================ROUTE

from django.urls import path
from .views import additem, index, objectcode, businesspartner, grpobarcode, progress, grpodoc, getkey, getlines, \
    goodsissue, goodsreceipt, AllItemAutoSN, registrationStored, apcreditmemo, apinvoice

urlpatterns = [
    path('api/inventory/stocktransfer', additem),
    path('api/', index),
    path('', index),
    path('api/progress', progress),

    path('api/object', objectcode),
    path('api/businesspartner', businesspartner),
    path('api/grpo', grpobarcode),
    path('api/document/grpo', grpodoc),
    path('api/document/getkey', getkey),
    path('api/document/getlines', getlines),

    path('api/inventory/goodsissue', goodsissue),
    path('api/inventory/goodsreceipt', goodsreceipt),

    path('api/inventory/autosn', AllItemAutoSN),
    path('api/storedprocedure/index', registrationStored),

    path('api/inventory/apcredit/memo', apcreditmemo),
    path('api/inventory/apcredit/invoice', apinvoice),

]
====================================================================
import numpy as np
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
import cv2

import re
from PIL import Image
from pytesseract import pytesseract
import pythoncom
import win32com.client
import json
import pyodbc
import pymysql
import pymssql
@api_view(['GET'])
@renderer_classes([JSONRenderer])
def index(request):

    #POSSIBLE SAP CONNECTION
    conn = connect("OUTEXCEL", 1, "192.168.1.8")
    bp = conn.GetBusinessObject("4")
    bp.GetByKey('I-003396')
    print(bp.ItemName)
    print(dir(conn))
    if conn == 0:
        print("Connection successful!")
    else:
        print(f"Connection failed with error code: {conn}")
    return Response("Welcome To SAP API powered by Python Django 4.0")
def pypyodbc(database,ip):
    conn = pyodbc.connect(
         DRIVER='{SQL Server}',
         SERVER=ip,
         UID='webdev',
         PWD='w3bp0r+aL',
         DATABASE=database)
    return conn
#w3bp0r+aL
def odbc(database, ip):

    # conn = pymssql.connect(
    #     DRIVER='{SQL Server}',
    #     SERVER=ip,
    #     UID='webdev',
    #     PWD='w3bp0r+aL',
    #     DATABASE=database
    # )
    conn = pymssql.connect(
        server=ip,
        user='webdev',
        password='w3bp0r+aL',
        database=database
    )

    return conn


def connect(database, password, xip):

    pythoncom.CoInitialize()
    company = win32com.client.Dispatch("SAPbobsCOM.Company")
    company.Server = xip
    company.LicenseServer = "192.168.1.4:30001"
    company.DbUserName = "webdev"
    company.DbPassword = "w3bp0r+aL"
    company.CompanyDB = database
    company.UserName = sapaccount(password)['username']
    company.Password = sapaccount(password)['password']
    company.DbServerType = "6"
    conn = company.Connect()
    return company
def sapaccount(level):

    if level == 1:
        account = { 'username': 'purch04', 'password': 'pUrch*04'}
        return account
    elif level == 2:
        account = {'username': 'purch02', 'password': 'puRch@02'}
        return account
    elif level == 3:
        account = {'username': 'purch01', 'password': 'purCh_01'}
        return account
    else:
        account = {'username': 'sapadmin', 'password': '123$qweE'}
        return account



def vendor(vendor,database):
    conn = pypyodbc(database, databaseIP(database))
    cursor = conn.cursor()
    query = "SELECT CardCode FROM OCRD WHERE CardName = ? AND CardType = 'S'"
    cursor.execute(query, (vendor,))
    cardcode = cursor.fetchone()

    if cardcode:
        return cardcode[0]
    else:
        return None


def getItemCode(database, itemname):
    conn = odbc(database,databaseIP(database))
    cursor = conn.cursor()
    cursor.execute(f"SELECT ItemCode FROM OITM where ItemName = '{itemname}'")
    item = cursor.fetchone()[0]
    return item

def disconnect_from_company(company):
    """
    Disconnects from the given company database in SAP Business One.
    """

    if company.Connected:
        company.Disconnect()

    return 0
@api_view(['POST'])
@renderer_classes([JSONRenderer])
def updateitem(request):
    data = request.POST.get('0')
    sapuser = request.POST.get('2')

    parsed_data = json.loads(data)

    uniqueID = parsed_data.get("uniqueID")
    item_m = parsed_data.get("model")
    cardname = parsed_data.get("prevendor")
    prop = request.POST.get('1')
    parsed_group = json.loads(prop)
    group = {}
    for index, item in enumerate(parsed_group):
        key = 'QryGroup' + str(index + 1)
        try:
            if item['status']:
                item['status'] = 'Y'
            else:
                item = {'status': 'N'}
        except Exception as e:
            item = {'status': 'N'}

        group[key] = item['status']
    # UDF DATA
    # SellOut
    selloutUDF = parsed_data.get('sellout') if parsed_data.get(
        'sellout') else ""
    # Subcat1
    subcat1UDF = parsed_data.get('subcat1') if parsed_data.get(
        'subcat1') else ""
    # Subcat2
    subcat2UDF = parsed_data.get('subcat2') if parsed_data.get(
        'subcat2') else ""
    # SRP
    srpUDF = parsed_data.get('srp') if parsed_data.get('srp') else ""
    # RegularNetCost
    regularnetcostUDF = parsed_data.get('regnetcost') if parsed_data.get(
        'regnetcost') else ""
    # PresentNetCost
    presentnetcostUDF = parsed_data.get('prenetcost') if parsed_data.get(
        'prenetcost') else ""
    # Sizes
    sizesUDF = parsed_data.get('sizes') if parsed_data.get('sizes') else ""
    subsydUDF = parsed_data.get('instsubamp') if parsed_data.get(
        'instsubamp') else ""
    sizenameUDF = parsed_data.get('sizename') if parsed_data.get(
        'sizename') else ""
    specs1UDF = parsed_data.get('specs1') if parsed_data.get('specs1') else ""
    specs2UDF = parsed_data.get('specs2') if parsed_data.get(
        'specs2') else ""
    specs3UDF = parsed_data.get('specs3') if parsed_data.get(
        'specs3') else ""
    typeUDF = parsed_data.get('type') if parsed_data.get('type') else ""
    freebiesUDF = parsed_data.get('freebies') if parsed_data.get('freebies') else ""
    gdpUDF = parsed_data.get('grossdealerprice') if parsed_data.get('grossdealerprice') else ""
    #subcatgroupUDF = parsed_data.get("subcatgroup")['Name']  if parsed_data.get("subcatgroup")['Name'] else ""
    database = [
          "OUTEXCEL",
          "ADDESSA_NEWPROD",
          "STEADFORD",
          "APPLIANTECH",
          "ELECTROLOOP",
          "THREATHONS",
          "PANAPPLIANCE",
          "EASYOWN",
          "METROILOCOS"


    ]

    msg = {}
    for index, db in enumerate(database):

        try:
            n = getItemCode(db, parsed_data.get("oldmodels"))
            msg[db] = db
        except Exception as e:
            n = None
    if len(msg) != 1:
        cc = len(msg) - 1
    else:
        cc = len(msg)

    databaseCount = 100/cc

    if (msg):
        print(f"DB-COUNT: {len(msg)}")
        response_data = {}
        msg['identify'] = 0
        updateProgress(uniqueID, 10)
        if parsed_data.get('batchserial') == "Serial Number":
            identifySerial = 1
        else:
            identifySerial = 0

        if parsed_data.get('withHtaxt'):
            withHtaxt = 1
        else:
            withHtaxt = 0
        for index, db in enumerate(msg):
                try:
                    print('ipget = databaseIP(db)')
                    ipget = databaseIP(db)
                    print('company = connect(db, sapuser, ipget)')
                    print(db, sapuser, ipget)
                    company = connect(db, 1, ipget)
                    print("company.GetBusinessObject")
                    bp = company.GetBusinessObject("4")
                    print(getItemCode(db, parsed_data.get("oldmodels")))
                    print("bp.GetByKey(getItemCode")
                    if bp.GetByKey(getItemCode(db, parsed_data.get("oldmodels"))):

                        bp.ItemName = item_m
                        # ITEMGROUP
                        bp.ItemsGroupCode = parsed_data.get('itmgroup')
                        bp.ForeignName = parsed_data.get('prodcat')
                        #WITHHOLDING TAX
                        bp.WTLiable = withHtaxt
                        print("identifySerial")
                        bp.ManageSerialNumbers = identifySerial
                        bp.WarrantyTemplate = parsed_data.get('warrantytemp')
                        #FIRMCODE
                        print("recheckbrand")
                        bp.Manufacturer = recheckbrand(parsed_data['brand']['FirmCode'], db)
                        print("vendor")
                        bp.UserFields.Fields.Item("CardCode").Value = vendor(cardname, db)
                        bp.PurchaseUnit = parsed_data.get('purchaseuom')
                        bp.InventoryUOM = parsed_data.get('inventoryoum')
                        bp.SalesUnit = parsed_data.get('salesoum')
                        bp.UserFields.Fields.Item("U_BA_LVAFrom").Value = selloutUDF
                        bp.UserFields.Fields.Item("U_U_Subcat1").Value = subcat1UDF
                        bp.UserFields.Fields.Item("U_U_Subcat2").Value = subcat2UDF
                        bp.UserFields.Fields.Item("U_srp").Value = srpUDF
                        bp.UserFields.Fields.Item("U_RegNC").Value = regularnetcostUDF
                        bp.UserFields.Fields.Item("U_PresentNC").Value = presentnetcostUDF
                        bp.UserFields.Fields.Item("U_cSizes").Value = sizesUDF
                        bp.UserFields.Fields.Item("U_SubsidyAmt").Value = subsydUDF
                        bp.UserFields.Fields.Item("U_rSubCat").Value = sizenameUDF
                        bp.UserFields.Fields.Item("U_cPanel").Value = specs1UDF
                        bp.UserFields.Fields.Item("U_cContent").Value = specs2UDF
                        bp.UserFields.Fields.Item("U_cTransmission").Value = specs3UDF
                        bp.UserFields.Fields.Item("U_cType").Value = typeUDF
                        bp.UserFields.Fields.Item("U_Freebies").Value = freebiesUDF
                        bp.UserFields.Fields.Item("U_GDP").Value = gdpUDF
                        try:
                            subcat_name = parsed_data.get("subcatgroup")['Name']
                        except (TypeError, KeyError):
                            subcat_name = ""  # Default value kung walang laman
                        bp.UserFields.Fields.Item("U_SubCatGroup").Value = subcat_name  if subcat_name else ""
                        print("update")
                        bp.Update()
                        print('last')
                        response_data[db] = f"Item Updated successfully"
                        print(databaseCount * index, db)
                        updateProgress(uniqueID, databaseCount * index)
                        print("getItemCode")
                        print(getItemCode(db, parsed_data.get("oldmodels")))
                        print(group)
                        print("additempro")

                        addItemPro(group, db, getItemCode(db, parsed_data.get("oldmodels")))
                        print('final')
                        bp = None
                        #pythoncom.CoUninitialize()
                        disconnect_from_company(company)
                        print('final1')
                    else:

                        code = getItemCode(db, item_m)
                        response_data[db] = f"Item with code {code} not found."
                        print(f"Item with code {code} not found.")
                except Exception as e:
                    if db != "identify":
                        response_data[db] = f"{e}"
        return Response(response_data)
@api_view(['GET'])
@renderer_classes([JSONRenderer])
def addVendor(request):
    vendorAdd = connect("ReportsOptn", "werT123$").GetBusinessObject("30")
    return Response(dir(vendorAdd))
    vendorAdd.Code = "VENDOR_CODE"  # Set the vendor code
    vendorAdd.Name = "Vendor Name"  # Set the vendor name
    vendorAdd.Add()
    return Response("d")

def checkbrand(id):

        conn = odbc("STEADFORD","192.168.1.8")
        cursor = conn.cursor()
        cursor.execute(f"SELECT FirmName FROM OMRC where FirmCode = '{id}'")
        code = cursor.fetchone()[0]

        finale = odbc("EASYOWN", "192.168.1.8").cursor()
        finale.execute(f"SELECT FirmCode FROM OMRC where FirmName = '{code}'")
        data = finale.fetchone()[0]

        return data
def recheckbrand(id, database):
    #GET THE PLAIN TEXT BRAND
    conn = odbc("ADDESSA_NEWPROD", "192.168.1.15")
    cursor = conn.cursor()
    cursor.execute(f"SELECT FirmName FROM OMRC where FirmCode = '{id}'")
    code = cursor.fetchone()[0]
    #GET PLAIN CODE
    if database == 'ADDESSA_NEWPROD':

       finale = odbc(database, "192.168.1.15").cursor()
    else:
       finale = odbc(database, "192.168.1.8").cursor()

    finale.execute(f"SELECT FirmCode FROM OMRC where FirmName = '{code}'")
    data = finale.fetchone()[0]

    return data
@api_view(['POST'])
@renderer_classes([JSONRenderer])
def additem(request):
    databases = request.POST.get('2')
    dblist = json.loads(databases)
    data = request.POST.get('0')
    parsed_data = json.loads(data)
    sapuser = request.POST.get('3')
    cardname = parsed_data.get("prevendor")
    uniqueID = parsed_data.get("uniqueID")
    itemsww = {}
    msg = {}
    dd = []
    for db in (dblist):
        try:
            n = vendor(cardname, db)
            xip = databaseIP(db)
            dd.append({"database": db,"vendor": n , "ip": xip})
        except Exception as e:
            n = None
            msg[db] = (f"There's No {cardname} at {db}: {str(e)}")
        if db == 'EASYOWN':
            try:
                checkbrand(parsed_data.get('brand'))
            except Exception as e:
                n = None
                msg[db] = (f"There's No Brand {parsed_data.get('brand')} at {db}: {str(e)}")
    if(msg):
        msg['identify'] = 1
        return Response(msg)
    else:
        msg['identify'] = 0
        if parsed_data.get('batchserial') == "Serial Number":
            identifySerial = 1
        else:
            identifySerial = 0

        if parsed_data.get('withHtaxt'):
            withHtaxt = 1
        else:
            withHtaxt = 0
        prop = request.POST.get('1')
        parsed_group = json.loads(prop)
        group = {}
        for index, item in enumerate(parsed_group):
            key = 'QryGroup' + str(index + 1)
            try:
                if item['status']:
                    item['status'] = 'Y'
                else:
                    item = {'status': 'N'}
            except Exception as e:
                item = {'status': 'N'}

            group[key] = item['status']
        #UDF DATA
        # SellOut
        selloutUDF = parsed_data.get('sellout') if parsed_data.get(
            'sellout') else ""
        # Subcat1
        subcat1UDF = parsed_data.get('subcat1') if parsed_data.get(
            'subcat1') else ""
        # Subcat2
        subcat2UDF = parsed_data.get('subcat2') if parsed_data.get(
            'subcat2') else ""
        # SRP
        srpUDF = parsed_data.get('srp') if parsed_data.get('srp') else ""
        # RegularNetCost
        regularnetcostUDF = parsed_data.get('regnetcost') if parsed_data.get(
            'regnetcost') else ""
        # PresentNetCost
        presentnetcostUDF = parsed_data.get('prenetcost') if parsed_data.get(
            'prenetcost') else ""
        # Sizes
        sizesUDF = parsed_data.get('sizes') if parsed_data.get('sizes') else ""
        subsydUDF = parsed_data.get('instsubamp') if parsed_data.get(
            'instsubamp') else ""
        sizenameUDF = parsed_data.get('sizename') if parsed_data.get(
            'sizename') else ""
        specs1UDF = parsed_data.get('specs1') if parsed_data.get('specs1') else ""
        specs2UDF = parsed_data.get('specs2') if parsed_data.get(
            'specs2') else ""
        specs3UDF = parsed_data.get('specs3') if parsed_data.get(
            'specs3') else ""
        typeUDF = parsed_data.get('type') if parsed_data.get('type') else ""
        freebiesUDF = parsed_data.get('freebies') if parsed_data.get('freebies') else ""
        gdpUDF = parsed_data.get('grossdealerprice') if parsed_data.get('grossdealerprice') else ""

        subcatgroupUDF = ""
        subcatgroup = parsed_data.get("subcatgroup")

        if subcatgroup and "Name" in subcatgroup:
            subcatgroupUDF = subcatgroup["Name"]
        # subcatgroupUDF =  parsed_data.get("subcatgroup")['Name']  if parsed_data.get("subcatgroup")['Name'] else ""
        updateProgress(uniqueID, 10)
        if len(dd) != 1:
            cc = len(dd) - 1
        else:
            cc = len(dd)
        databaseCount = 100 / cc
        response_data = {}
        for index, data in enumerate(dd):
            try:
                company = connect(data["database"], 1, data["ip"])
                # ReportsOptn
                # bp.ItemCode = Itemcode
                bp = company.GetBusinessObject("4")
                bp.Series = Series(data["database"])
                bp.ItemName = parsed_data.get('model')
                # ITEMGROUP
                bp.ItemsGroupCode = parsed_data.get('itmgroup')
                bp.InventoryItem = 1
                bp.SalesItem = 1
                # FOREIGNAME
                bp.ForeignName = parsed_data.get('prodcat')
                # WITHHOLDING TAX
                bp.WTLiable = withHtaxt
                bp.ManageSerialNumbers = identifySerial
                bp.WarrantyTemplate = parsed_data.get('warrantytemp') if parsed_data.get('warrantytemp') else ""
                # FIRMCODE
                if data["database"] == 'EASYOWN':
                    bp.Manufacturer = checkbrand(parsed_data.get('brand'))
                else:
                    bp.Manufacturer = recheckbrand(parsed_data.get('brand'), data["database"])
                print(data["vendor"])
                # bp.PutProperty("PreferredVendors", ["V0012947"])    #bp.SetProperty("PreferredVendors", ["V0012947"])
                bp.UserFields.Fields.Item("CardCode").Value = data["vendor"]
                bp.PurchaseUnit = parsed_data.get('purchaseuom')
                bp.InventoryUOM = parsed_data.get('inventoryoum')
                bp.SalesUnit = parsed_data.get('salesoum')
                if data["database"] != "ADDESSA_NEWPROD":
                    try:
                        bp.SWW = itemsww["sww"]
                    except KeyError:
                        print("Key 'sww' not found in itemsww dictionary")
                # UDF
                # SellOut
                bp.UserFields.Fields.Item("U_BA_LVAFrom").Value = selloutUDF
                # Subcat1
                bp.UserFields.Fields.Item("U_U_Subcat1").Value = subcat1UDF
                # Subcat2
                bp.UserFields.Fields.Item("U_U_Subcat2").Value = subcat2UDF
                # SRP
                bp.UserFields.Fields.Item("U_srp").Value = srpUDF
                # RegularNetCost
                bp.UserFields.Fields.Item("U_RegNC").Value = regularnetcostUDF
                # PresentNetCost
                bp.UserFields.Fields.Item("U_PresentNC").Value = presentnetcostUDF
                # Sizes
                bp.UserFields.Fields.Item("U_cSizes").Value = sizesUDF
                bp.UserFields.Fields.Item("U_SubsidyAmt").Value = subsydUDF
                bp.UserFields.Fields.Item("U_rSubCat").Value = sizenameUDF
                bp.UserFields.Fields.Item("U_cPanel").Value = specs1UDF
                bp.UserFields.Fields.Item("U_cContent").Value = specs2UDF
                bp.UserFields.Fields.Item("U_cTransmission").Value = specs3UDF
                bp.UserFields.Fields.Item("U_cType").Value = typeUDF
                bp.UserFields.Fields.Item("U_Freebies").Value = freebiesUDF
                bp.UserFields.Fields.Item("U_GDP").Value = gdpUDF
                bp.UserFields.Fields.Item("U_SubCatGroup").Value = subcatgroupUDF
                if bp.Add() != 0:
                    response_data[data["database"]] = str(company.GetLastError())
                else:
                    item_code = company.GetNewObjectKey()
                    addItemPro(group, data["database"], item_code)
                    if data["database"] == "ADDESSA_NEWPROD":
                        itemsww["sww"] = item_code
                    response_data[data["database"]] = f"Item added successfully {item_code}"
                    disconnect_from_company(company)
                    #pythoncom.CoUninitialize()
                    updateProgress(uniqueID, databaseCount * index)
            except Exception as e:
                response_data[data["database"]] = f"{e}"
        return Response(response_data)
def Series(database):
    if database == "ADDESSA_NEWPROD":
        series = "1681"
    if database == "STEADFORD":
        series = "88"
    if database == "OUTEXCEL":
        series = "47"
    if database == "APPLIANTECH":
        series = "84"
    if database == "ELECTROLOOP":
        series = "156"
    if database == "THREATHONS":
        series = "156"
    if database == "PANAPPLIANCE":
        series = "48"
    if database == "EASYOWN":
        series = "70"
    if database == "METROILOCOS":
        series = "132"

    return series
def databaseIP(database):
    if database == "ADDESSA_NEWPROD":
        ip = "192.168.1.15"
    else:
        ip = "192.168.1.8"

    return ip

def addItemPro(group,database,itemcode):

    for key, value in group.items():
              conn = odbc(database,databaseIP(database))
              cursor = conn.cursor()
              query = f"UPDATE OITM SET {key} = '{value}' WHERE ItemCode = '{itemcode}'"
              cursor.execute(query)
              conn.commit()
              cursor.close()
              conn.close()

    return Response("Item updated successfully")

@api_view(['GET'])
@renderer_classes([JSONRenderer])
def preferredV(request):


    conn1 = odbc("STEADFORD","192.168.1.8")
    conn2 = odbc("OUTEXCEL","192.168.1.8")
    cursor1 = conn1.cursor()
    cursor2 = conn2.cursor()
    cursor1.execute("SELECT CardName, CardCode FROM OCRD WHERE CardType = 'S'")
    cursor2.execute("SELECT CardName, CardCode FROM OCRD WHERE CardType = 'S'")
    rows1 = cursor1.fetchall()
    rows2 = cursor2.fetchall()

    # Create a set to keep track of existing CardNames
    existing_card_names = set(row.CardName for row in rows1)

    # Merge the arrays, avoiding duplicates based on CardName
    merged_rows = list(rows1)
    merged_rows.extend(row for row in rows2 if row.CardName not in existing_card_names)

    # Convert merged_rows to a list of dictionaries
    columns = [column[0] for column in cursor1.description]  # Assuming cursor1 has the same column names as cursor2
    result = [dict(zip(columns, row)) for row in merged_rows]

    return Response(result)


@api_view(['GET'])
@renderer_classes([JSONRenderer])
def field(request):
    req = request.query_params.get('data', None)
    conn = odbc("ADDESSA_NEWPROD", "192.168.1.15")
    cursor = conn.cursor()
    if req == "firmcode":
        cursor.execute("SELECT * FROM OMRC")
    elif req == "warranty1":
        cursor.execute("SELECT TmpltName FROM OCTT")
    elif req == "pvendor":
        cursor.execute("SELECT CardName,CardCode FROM OCRD where CardType = 'S'")
    elif req == "oitb":
        cursor.execute("SELECT ItmsGrpCod,ItmsGrpNam FROM OITB")
    elif req == "oitg":
        cursor.execute("SELECT TOP 8 ItmsTypCod, ItmsGrpNam FROM OITG ORDER BY ItmsTypCod ASC;")
    else:
        return Response("Command Not Found")
    rows = cursor.fetchall()
    warranty_template = []
    columns = [column[0] for column in cursor.description]  # Get the column names
    for row in rows:
        row_dict = dict(zip(columns, row))
        warranty_template.append(row_dict)

    # Return the list of dictionaries as a JSON response
    return Response(warranty_template)
@api_view(['GET'])
@renderer_classes([JSONRenderer])
def progress(request):
    identify = request.query_params.get('data', None)
    connection = pymysql.connect(host='192.168.1.3',port=3306, user='stevefox', password='M15@2dwin0n7y', database='progress')
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM progress WHERE identify = '{identify}'")
    row = cursor.fetchone()
    if row:
        val = row[2]
    else:
        val = "No match"
    connection.close()
    return Response(val)

def updateProgress(uniqueID,val):
    connection = pymysql.connect(host='192.168.1.3', port=3306, user='stevefox', password='M15@2dwin0n7y',
                                 database='progress')
    cursor = connection.cursor()
    # Check if the record exists
    select_query = f"SELECT * FROM progress WHERE identify = '{uniqueID}'"
    cursor.execute(select_query)
    result = cursor.fetchone()

    if result is None:
        # Record does not exist, perform an INSERT operation
        insert_query = f"INSERT INTO progress (identify, progress) VALUES ('{uniqueID}', '{val}')"
        cursor.execute(insert_query)
        connection.commit()
    else:
        # Record exists, perform an UPDATE operation
        update_query = f"UPDATE progress SET progress = '{val}' WHERE identify = '{uniqueID}'"
        cursor.execute(update_query)
        connection.commit()

    cursor.close()
    connection.close()
    return Response("success")

@api_view(['GET'])
@renderer_classes([JSONRenderer])
def syncReport(request):
    database = [
        # "ReportsOptn",
         # "SteadfordReports",
           "OutexcelReports",
        #  "AppliantechReports",
       #   "ElectroloopReports",
        #  "ThreathonsReports",
        #  "PanApplianceReports"
    ]
    for db in (database):
        conn = odbc(db)
        cursor = conn.cursor()
        with open(r'C:\Users\stevefoxlinux\AppData\Roaming\Python\Python310-32\Scripts\diapi\sql\creditportal.sql',
                  'r') as file:
            sql = file.read()
            # Execute the external SQL file using the cursor object.
        cursor.execute(sql)

        # Fetch the results of the query using the cursor object.
        results = cursor.fetchall()

        # Close the external SQL file.
        file.close()

        # Close the cursor object.
        cursor.close()

        # Print the results of the query.
        for row in results:
            print(row)

        return Response('ok')

=================================================ROUTE

from django.urls import path
from .views import additem,field,index,preferredV,progress,updateitem,syncReport

urlpatterns = [
    path('api/add', additem),
    path('api/fields',field),
    path('api/', index),
    path('', index),
    path('api/preferred', preferredV),
    path('api/progress', progress),
    path('api/update', updateitem),

    path('api/sync/reports', syncReport),



]

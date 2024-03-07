import 'react-native-get-random-values';
import { v4 as uuidV4 } from "uuid";
import base64 from "react-native-base64";
import pako from 'pako';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';

class DSBApi {
  constructor(
    private username: string,
    private password: string,
    private DATA_URL: string = "https://app.dsbcontrol.de/JsonHandler.ashx/GetData",
    private tableMapper: string[] = ['type','class','lesson','subject','room','new_subject','new_teacher','teacher']
  ) { }

  public async fetch_entries() {
    const current_date = new Date().toISOString().slice(0, -5) + "Z";

    const params = {
      UserId: this.username,
      UserPw: this.password,
      AppVersion: "2.5.9",
      Language: "de",
      OsVersion: "28 8.0",
      AppId: uuidV4(),
      Device: "SM-G950F",
      BundleId: "de.heinekingmedia.dsbmobile",
      DateFrom: current_date,
      LastUpdate: current_date,
    }

    const params_byte_string = Buffer.from(JSON.stringify(params, null, 0)).toString('utf-8');
    const params_compressed = base64.encode(Buffer.from(pako.gzip(params_byte_string)).toString());


    const json_data = {"req": {"Data": params_compressed, "DataType": 1}};
    const response = await fetch(this.DATA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(json_data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const timetable_data = await response.json();

    const data_compressed = timetable_data["d"];
    const data_byte_array = Uint8Array.from(base64.decode(data_compressed), c => c.charCodeAt(0));
    const data = JSON.parse(pako.inflate(data_byte_array, { to: 'string' }));

    if (data["Resultcode"] !== 0) {
      throw new Error(`DSB API error! code: ${data["Resultcode"]}`);
    }

    let final_data = [];
    for (let page of data["ResultMenuItems"][0]["Childs"]) {
      for (let child of page["Root"]["Childs"]) {
        if (child["Childs"] instanceof Array) {
          for (let entry of child["Childs"]) {
            final_data.push(entry);
          }
        } else {
          final_data.push(child["Childs"]["Detail"]);
        }
      }
    }

    if (final_data.length === 0) {
      throw new Error("No data found!");
    }

    let final_data_formatted = [];
    for (let entry of final_data) {
      if (entry.endsWith(".htm") && !entry.endsWith(".html") && !entry.endsWith("news.htm")) {
        final_data_formatted.push(entry);
      }
    }
    if (final_data_formatted.length === 1) {
      return final_data_formatted[0];
    }
    return final_data_formatted;
  }
}

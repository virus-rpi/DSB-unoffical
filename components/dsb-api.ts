import { Buffer } from "@craftzdog/react-native-buffer";
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import * as base64 from 'base64-js';
import axios from "axios";
import * as cheerio from 'cheerio';
import gzip from 'gzip-js';

export class DsbApi {
  private username: string;
  private password: string;
  private DATA_URL: string;
  private table_mapper: string[];
  constructor(username: string, password: string) {
    this.DATA_URL = "https://app.dsbcontrol.de/JsonHandler.ashx/GetData";
    this.username = username;
    this.password = password;
    this.table_mapper = ['type','class','lesson','subject','room','new_subject','new_teacher','teacher']
  }

  public fetch_entries = async () => {
    const current_time: string = new Date().toISOString().slice(0, -1) + 'Z';

    const params = {
      "UserId": this.username,
      "UserPw": this.password,
      "AppVersion": "2.5.9",
      "Language": "de",
      "OsVersion": "28 8.0",
      "AppId": uuidv4(),
      "Device": "SM-G950F",
      "BundleId": "de.heinekingmedia.dsbmobile",
      "Date": current_time,
      "LastUpdate": current_time,
    }

    const paramsBytestring = Buffer.from(JSON.stringify(params), 'utf-8');
    const paramsCompressed = gzip.zip(paramsBytestring);
    const paramsCompressedString = base64.fromByteArray(new Uint8Array(paramsCompressed));

    const json_data = {"req": paramsCompressedString, "DataType": 1};
    axios.post(this.DATA_URL, json_data, {headers: {'Content-Type': 'application/json'}})
    .then(async response => {
      const timetable_data = response.data;

      const data_compressed = JSON.parse(timetable_data).data["d"];
      const data = JSON.parse(gzip.unzip(base64.toByteArray(data_compressed)).toString());

      if (data["Resultcode"] !== 0) {
        throw new Error(data["ResultStatusMessage"]);
      }

      let final = [];
      for (const page of data["ResultMenuItems"][0]["Childs"]) {
        for (const child of page["Root"]["Childs"]) {
          if (Array.isArray(child["Childs"])) {
            for (const subChild of child["Childs"]) {
              final.push(subChild["Detail"]);
            }
          } else {
            final.push(child["Childs"]["Detail"]);
          }
        }
      }
      if (final.length === 0) {
        throw new Error("No data found");
      }

      let output = [];
      for (const entry of final) {
        if (entry.endsWith(".htm") && !entry.endsWith(".html") && !entry.endsWith("news.htm")) {
          output.push(await this.fetch_timetable(entry));
        }
      }
      if (output.length === 1) {
        return output[0];
      } else {
        return output;
      }
    })
    .catch(error => {
        console.error(error);
        return [];
    });
  }
  private fetch_timetable = async (url: string) => {
        const results: object[] = [];
        const response = await axios.get(url);
        const soupi = cheerio.load(response.data);

        let ind = -1;
        soupi('table.mon_list').each((_index, element) => {
            ind += 1;
            const updates = soupi('table.mon_head span').eq(ind).text().split('Stand: ')[1];
            const titles = soupi('div.mon_title').eq(ind).text();
            const date = titles.split(' ')[0];
            const day = titles.split(', ')[0].replace(',', '');
            const entries = soupi(element).find('tr').get();
            entries.shift(); // Remove the first entry

            let currentClass = '';
            entries.forEach(entry => {
                const infos = soupi(entry).find('td').get();
                if (infos.length < 2) {
                    currentClass = soupi(infos[0]).text();
                    return; // Continue to the next iteration
                }

                const classes = soupi(infos[1]).text().split(', ');
                classes.forEach(class_ => {
                    const newEntry: any = {};
                    newEntry.date = date;
                    newEntry.day = day;
                    newEntry.updated = updates;

                    for (let i = 0; i < Math.max(this.table_mapper.length, infos.length) + 1; i++) {
                        const attribute = i < this.table_mapper.length ? this.table_mapper[i] : 'col' + i;
                        if (attribute === 'class') {
                            newEntry[attribute] = currentClass;
                        } else {
                            newEntry[attribute] = soupi(infos[i]).text() !== '\xa0' ? soupi(infos[i]).text() : '---';
                        }
                    }
                    results.push(newEntry);
                });
            });
        });
        return results;
    }
}
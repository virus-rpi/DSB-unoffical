import {Card, ItemType} from "./components/carousel";
import {settings} from "./components/settings";
import {useEffect, useState} from "react";
import Dsbmobile, {TimeTable} from "dsbmobile";

export function useApi() {
    const [data, setData] = useState<Card[]>([
        {
            id: '1', date: new Date(), items:
                [
                    {subject: "Biologie", type: ItemType.omitted, room: "", time: [1, 2], araf: "mebis", teacher: ""},
                    {subject: "Deutsch", type: ItemType.stand_in, room: "1.14", time: [5, 6], araf: "", teacher: "Herr Müller"},
                    {subject: "Englisch", type: ItemType.room_change, room: "1.14", time: [7, 8], araf: "", teacher: ""},
                ],
            missing_teachers: ["Frau Müller", "Herr Schmidt"],
            class: "11p",
        },
        {id: '2', date: new Date(), items: [], missing_teachers: [], class: "11p"},
        {
            id: '3', date: new Date(), items:
                [
                    {subject: "Sport", type: ItemType.omitted, room: "", time: [1, 1], araf: "", teacher: ""},
                ],
            missing_teachers: ["Frau Müller", "Herr Schmidt"],
            class: "11a",
        },
    ]);
    const [school_name, setSchoolName] = useState<string>("DSB");

    const [possible_classes, setPossibleClasses] = useState<string[]>(["5a", "5b", "5c", "6a", "6b", "6c", "7a", "7b", "7c", "8a", "8p", "8k", "9a", "9p", "9k", "10a", "10p", "10k", "11a", "11p", "11k", "12a", "12p", "12k"]);

    useEffect(() => {
        setInterval(() => {
            settings().loadData("school").then((schoolSetting) => {
                    if (schoolSetting !== undefined && schoolSetting !== null) {
                        setSchoolName(JSON.parse(schoolSetting).name);
                    }
                }
            );
            settings().loadData("classes").then((classesSetting) => {
                if (classesSetting !== undefined && classesSetting !== null) {
                    setPossibleClasses(JSON.parse(classesSetting));
                }
            });
        }, 1000);

    }, []);

    async function getTableData() {
        const schoolSettings = await settings().loadData("school");

        if (schoolSettings != null) {
            console.log("School settings found");
            const dsb = new Dsbmobile(JSON.parse(schoolSettings).username, JSON.parse(schoolSettings).password);
            // TODO: check if other methods of dsb return the correct data
            console.log(await dsb.getTimetable());
            return await dsb.getTimetable();
        } else {
            console.log("No school settings found");
            return undefined;
        }
    }

    function processTableData(tableData: TimeTable) {
        let entries: Card[] = [];

        for (const class_ of possible_classes) {
            const entryForClass = tableData.findByClassName(class_);
            if (entryForClass !== undefined) {
                entries.push({
                    class: class_,
                    missing_teachers: [],
                    id: (entries.length + 1) + "",
                    date: new Date(),
                    items: []
                });
            } else { //TODO: add formatting so that the correct data is pushed
                entries.push({
                    class: class_,
                    missing_teachers: [],
                    id: (entries.length + 1) + "",
                    date: new Date(),
                    items: []
                });
            }
        }

        return entries;
    }

    useEffect(() => {
        getTableData().then((tableData) => {
            if (tableData === undefined) {
                return;
            }
            setData(processTableData(tableData));
            // bconsole.log(tableData.toJSON());
        });
        setInterval(() => {

        }, 600000);

    }, []);

    function getData() {
        return {data: data, school_name: school_name, possible_classes: possible_classes};
    }

    return {getData};
}
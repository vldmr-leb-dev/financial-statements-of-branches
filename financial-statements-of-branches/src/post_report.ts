import { Iresult_post_text } from './types.ts';
import express from "express";
const app = express()
const port = 3000
app.use(express.json())
app.use(express.urlencoded({extended: true}))

let month_all: string[] = ["January", "February", "March", "April", "May", "June"]

export default async function edit_post_request() {

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

  app.post("/", async (req, res) => {
    console.log(req.body)

    let rez = await post_result(req.body);
    console.log(rez);

    // res.status(200).send({ "message": rez})
    res.status(200).send({ rez })
  })
}

async function post_result(dp_filial_post: any) {

  let filial: string | any[] = [];
  let lengthJson = Object.keys(dp_filial_post).length

  for (let i = 0; i < lengthJson / 3; i++) {
    filial[i] = [dp_filial_post["id_filial_" + (i+1)], dp_filial_post["timezone_filial_" + (i+1)], dp_filial_post["ccy_filial_" + (i+1)]]
  }

  // Загружаем конвертер
    let converter = await fetch(
    'https://v6.exchangerate-api.com/v6/9b457121ae4a356fb8990006/latest/' +
    filial[0][2],
  )
    .then((response) => response.json())
    // .then((json) => console.log(json["title"]));
    .then((json) => json);

  //Создаем переменные для обработки
  // spent[id] = [year, month, date, hour, id_filial, id category, ccy, base_ccy]
  let spent: string | any[] = [];

  let date: Date = new Date(2025, 0, 1, 0, 0, 0);
  let random_filial;
  let spent_ccy;
  let cathegory_spent = 5;
  let month_spent_ccy = 0;

  // Заполняем расходы
  for (let i = 0; i < 24 * 30 * 4; i++) {
    random_filial = getRandomInt(0, filial.length - 1);
    spent_ccy = getRandomInt(0, 100);

    if (random_filial == 0) {
      spent[i] = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), random_filial, getRandomInt(0, cathegory_spent), spent_ccy, spent_ccy];
    } else {
      date.setHours(date.getHours() + parseInt(filial[random_filial][1]));
      spent[i] = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), random_filial, getRandomInt(0, cathegory_spent), spent_ccy, Number(spent_ccy/converter["conversion_rates"][filial[random_filial][2]]).toFixed()]
      date.setHours(date.getHours() - parseInt(filial[random_filial][1]));
    }
    date.setHours(date.getHours() + 1);
  }

  //Создаем массив для суммирования расходов
  let all_spent: number[] = [];
  all_spent.length = filial.length;
  for (let i = 0; i < filial.length; i++) {all_spent[i] = 0;}

  // Суммируем расход по филлиалам
  let total_all_filial: number = 0;
  for (let i = 0; i < spent.length; i++) {
    if (spent[i][1] == month_spent_ccy) {
      all_spent[spent[i][4]] = all_spent[spent[i][4]] + parseInt(spent[i][7]);
      total_all_filial = total_all_filial + parseInt(spent[i][7]);
    }
  }

  let cathegory: number[] = [];

  let result_post_text: Iresult_post_text = {
    "Monthly report": month_all[month_spent_ccy],
    "Report from all filial in base ccy": all_spent + ' ' + filial[0][2],
    "Total spent from all filial in base ccy": total_all_filial + ' ' + filial[0][2],
  };

  for (let i = 0; i < filial.length; i++) {
    result_post_text['Report from filial ' + filial[i][0]] = filial[i][0];
    result_post_text['Planned spent from filial ' + filial[i][0]] = Number(total_all_filial / filial.length).toFixed(0);
    result_post_text['Real spent from filial ' + filial[i][0]] = Number(all_spent[i]).toFixed(0);
    result_post_text['Result spent from filial ' + filial[i][0]] = Number(total_all_filial / filial.length - all_spent[i]).toFixed(0);

    for (let i = 0; i < cathegory_spent + 1; i++) {
      cathegory[i] = 0;
    }

    for (let y = 0; y < spent.length; y++) {
      if (i == spent[y][4] && spent[y][1] == month_spent_ccy) {
        cathegory[spent[y][5]] = cathegory[spent[y][5]] + parseInt(spent[y][7]);
      }
    }

    result_post_text['Report by cathegory from filial ' + filial[i][0]] = filial[i][0];

    for (let y = 0; y < cathegory.length; y++) {
      result_post_text['Filial ' + filial[i][0] + '. Cathegory spent ' + y] = Number(cathegory[y]).toFixed(0);
    }
  }

  // res.status(200).send({"message": "rez"})
  return result_post_text;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
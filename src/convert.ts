import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import * as csv from 'csv';
import { Client } from '@elastic/elasticsearch';
import {
  awsGetCredentials,
  createAWSConnection,
} from '@acuris/aws-es-connection';
import { format } from 'logform';
import cli = format.cli;

const filePath = __dirname + '/../data/13_Tokyo_20053_20203.csv';
const elasticSearchEndPoint = 'http:localhost:9200';
// 'https://search-es-with-cognito-547otdh65f2pll747f4sryzkfe.ap-northeast-1.es.amazonaws.com';

const convert = async () => {
  const awsCredentials = await awsGetCredentials();
  const awsConnection = createAWSConnection(awsCredentials);
  const client = new Client({
    // ...awsConnection,
    node: elasticSearchEndPoint,
  });
  let test = [];
  const stream = fs
    .createReadStream(filePath)
    .pipe(iconv.decodeStream('SJIS'))
    .pipe(iconv.encodeStream('UTF-8'))
    .pipe(csv.parse())
    .pipe(
      csv.transform(async (record) => {
        //"No","種類","地域","市区町村コード","都道府県名","市区町村名","地区名","最寄駅：名称","最寄駅：距離（分）","取引価格（総額）","坪単価","間取り","面積（�u）","取引価格（�u単価）","土地の形状","間口","延床面積（�u）","建築年"
        const data = {
          No: record[0],
          種類: record[1],
          地域: record[2],
          市区町村コード: record[3],
          都道府県名: record[4],
          市区町村名: record[5],
          地区名: record[6],
          '最寄駅：名称': record[7],
          '最寄駅：距離': record[8],
          '取引価格（総額）': record[9],
          坪単価: record[10],
          間取り: record[11],
          面積: record[12],
          取引価格: record[13],
          土地の形状: record[14],
          間口: record[15],
          延床面積: record[16],
          建築年: record[17],
          建物の構造: record[18],
          //,"建物の構造","用途","今後の利用目的","前面道路：方位","前面道路：種類","前面道路：幅員（ｍ）","都市計画"
          用途: record[19],
          今後の利用目的: record[20],
          '前面道路：方位': record[21],
          '前面道路：種類': record[22],
          '前面道路：幅員': record[23],
          都市計画: record[24],
          // ,"建ぺい率（％）","容積率（％）","取引時点","改装","取引の事情等"
          建ぺい率: record[25],
          容積率: record[26],
          取引時点: record[27],
          改装: record[28],
          取引の事情等: record[29],
        };
        test.push(data);
        // await client.create({
        //   index: 'test',
        //   id: data.No,
        //   body: data,
        //   refresh: 'wait_for',
        // });
      })
    );

  let count = 0;
  let total = 0;

  stream.on('data', (chunk) => {
    count++;
    // 테스트로 10건만 사용
    // if (count > 1000) {
    //   throw new Error('end for test.');
    // }
  });
  // データをすべて読み取り終わったら実行される
  stream.on('end',async () => {
    console.log(test[0]);
    console.log(`${count}回に分けて取得しました`);
    console.log(`合計${total}byte取得しました`);

  });

  // エラー処理
  stream.on('error', (err) => {
    console.log(err.message);
  });
};
convert();

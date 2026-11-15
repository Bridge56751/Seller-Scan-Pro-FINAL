import test from "node:test";
import assert from "node:assert/strict";
import { normalizeLensOffers } from "../server/services/searchapi";
import { sortOffersByPrice } from "../shared/offer-sorting";

test("Lens preserves priced and unpriced destinations and skips unsafe links",()=>{
  const {offers,excluded}=normalizeLensOffers({visual_matches:[
    {title:"Bottle",source:"A",link:"https://a.example/item"},
    {title:"Bottle",source:"B",link:"https://b.example/item",price:"$24*",extracted_price:24,currency:"USD"},
    {title:"Bottle",source:"C",link:"https://c.example/item",price:"€8",extracted_price:8,currency:"EUR"},
    {title:"Bottle",source:"D",link:"https://d.example/item",price:"$10",extracted_price:10,currency:"USD"},
    {title:"Bottle",source:"E",link:"https://e.example/item",price:"$12*",extracted_price:12},
    {title:"Bad",link:"javascript:alert(1)"},
    {title:"Duplicate",link:"https://a.example/item"},
  ]});
  assert.equal(offers.length,5);
  assert.equal(excluded,1);
  assert.equal(offers[0].priceText,"");
  assert.equal(offers[0].amount,null);
  assert.equal(offers[4].currency,null,"never infer dollars as USD");
  assert.deepEqual(sortOffersByPrice(offers,"USD","accurate","Bottle").map(o=>o.seller),["B","C","D","E","A"]);
  assert.deepEqual(sortOffersByPrice(offers,"USD","low").map(o=>o.seller),["D","B","E","C","A"]);
  assert.deepEqual(sortOffersByPrice(offers,"USD","high").map(o=>o.seller),["B","D","E","C","A"]);
  assert.equal(offers[0].seller,"A","sorting does not mutate provider order");
});

test("missing, invalid and unsafe Lens data cannot invent prices or images",()=>{
  assert.deepEqual(normalizeLensOffers({}).offers,[]);
  const {offers}=normalizeLensOffers({visual_matches:[
    {title:"A",link:"https://a.example",extracted_price:9,currency:"USD",thumbnail:"https://unpkg.com/a.png"},
    {title:"B",link:"https://b.example",price:"Contact seller",extracted_price:-1},
  ]});
  assert.equal(offers[0].amount,null);
  assert.equal(offers[0].currency,null);
  assert.equal(offers[0].imageUrl,null);
  assert.equal(offers[1].amount,null);
});

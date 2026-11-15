import test from "node:test";
import assert from "node:assert/strict";
import { isApprovedMarketplaceUrl } from "../shared/marketplace-policy";
import { normalizeLensOffers } from "../server/services/searchapi";

test("resale marketplaces, established retailers and selected brand stores are included",()=>{
  for (const url of ["https://www.ebay.com/itm/1","https://www.mercari.com/us/item/1",
    "https://www.ebay.co.uk/itm/1","https://poshmark.com/listing/1","https://www.nike.com/t/1",
    "https://www.bestbuy.com/site/1","https://www.amazon.com/dp/1"]) {
    assert.equal(isApprovedMarketplaceUrl(url),true,url);
  }
});
test("Temu, unknown stores, spoofed names and disguised URLs are excluded",()=>{
  for (const url of ["https://www.temu.com/item","https://temu.com","https://ebay.com.evil.example/1",
    "https://fake-ebay.com/1","https://ebay.com@evil.example/1","http://www.ebay.com/itm/1",
    "https://unknown.example/1","https://www.ebay.com:8443/itm/1","javascript:alert(1)",""]) {
    assert.equal(isApprovedMarketplaceUrl(url),false,url);
  }
});
test("seller labels cannot bypass destination filtering; unpriced approved matches survive",()=>{
  const result=normalizeLensOffers({visual_matches:[
    {title:"Bottle",source:"eBay",link:"https://temu.com/1",price:"$1",extracted_price:1},
    {title:"Bottle",source:"Official authorized retailer",link:"https://unknown.example/1"},
    {title:"Bottle",source:"Mercari",link:"https://www.mercari.com/us/item/1"},
  ]});
  assert.equal(result.excluded,2);
  assert.equal(result.offers.length,1);
  assert.equal(result.offers[0].seller,"Mercari");
  assert.equal(result.offers[0].amount,null);
});

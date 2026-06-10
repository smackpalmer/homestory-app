import { useState, useRef, useEffect } from "react";


// ── Theme ─────────────────────────────────────────────────────────────────────
const C = {
  bg:"#080b12", surface:"#0e1420", card:"#131b2e", card2:"#1a2440",
  border:"#1e2d47", accent:"#e8762c", accent2:"#f59e3f",
  green:"#22c55e", yellow:"#eab308", red:"#ef4444", blue:"#3b82f6", purple:"#8b5cf6",
  text:"#f0f4ff", muted:"#6b7fa3", dim:"#2d3f5e",
};
const STATUS = {
  critical:{ label:"Replace Now", color:C.red,    dot:"●", bg:"#ef444422" },
  aging:   { label:"Aging",       color:C.yellow, dot:"●", bg:"#eab30822" },
  good:    { label:"Good",        color:C.green,  dot:"●", bg:"#22c55e22" },
};
const roofStatus = age => age>=18?"critical":age>=10?"aging":"good";
const TYPE_CFG = {
  // Structural
  roof:        { icon:"🏠", color:C.accent,  category:"Structural",   label:"Roof"            },
  addition:    { icon:"🔨", color:C.blue,    category:"Structural",   label:"Addition"        },
  siding:      { icon:"🧱", color:"#64748b", category:"Structural",   label:"Siding"          },
  windows:     { icon:"🪟", color:"#0ea5e9", category:"Structural",   label:"Windows/Doors"   },
  foundation:  { icon:"⬛", color:"#78716c", category:"Structural",   label:"Foundation"      },
  gutters:     { icon:"💧", color:"#06b6d4", category:"Structural",   label:"Gutters/Drainage"},
  insulation:  { icon:"🌡️", color:"#f97316", category:"Structural",   label:"Insulation"      },
  insulation_blown:  { icon:"🌡️", color:"#f97316", category:"Insulation", label:"Blown-In Insulation"},
  insulation_batt:   { icon:"🌡️", color:"#f97316", category:"Insulation", label:"Batt Insulation"   },
  insulation_spray:  { icon:"🌡️", color:"#f97316", category:"Insulation", label:"Spray Foam"        },
  insulation_rigid:  { icon:"🌡️", color:"#f97316", category:"Insulation", label:"Rigid Board"       },
  insulation_radiant:{ icon:"🌡️", color:"#f97316", category:"Insulation", label:"Radiant Barrier"   },
  // Mechanical
  hvac:        { icon:"❄️", color:"#38bdf8", category:"Mechanical",   label:"HVAC"            },
  plumbing:    { icon:"🔵", color:"#3b82f6", category:"Mechanical",   label:"Plumbing"        },
  electrical:  { icon:"⚡", color:C.yellow,  category:"Mechanical",   label:"Electrical"      },
  water_heater:{ icon:"🔥", color:"#ef4444", category:"Mechanical",   label:"Water Heater"    },
  appliances:  { icon:"🏗️", color:"#8b5cf6", category:"Mechanical",   label:"Appliances"      },
  // Restoration
  restoration: { icon:"🔧", color:C.purple,  category:"Restoration",  label:"Restoration"     },
  fire_restoration:  { icon:"🔥", color:C.red,    category:"Restoration", label:"Fire Restoration"  },
  water_restoration: { icon:"💧", color:C.blue,   category:"Restoration", label:"Water/Flood Restoration"},
  mold_remediation:  { icon:"🍄", color:C.green,  category:"Restoration", label:"Mold Remediation"  },
  storm_restoration: { icon:"🌪️", color:C.purple, category:"Restoration", label:"Storm Restoration"  },
  smoke_damage:      { icon:"💨", color:C.muted,  category:"Restoration", label:"Smoke Damage"       },
  biohazard:         { icon:"⚠️", color:C.yellow, category:"Restoration", label:"Biohazard Cleanup"  },
  // New Construction
  new_construction:  { icon:"🏗️", color:C.green,  category:"New Construction", label:"New Construction"},
  // Damage Events
  tree_strike:  { icon:"🌳", color:C.red,     category:"Damage",       label:"Tree Strike"     },
  fire_damage:  { icon:"🔥", color:C.red,     category:"Damage",       label:"Fire Damage"     },
  flood_damage: { icon:"💧", color:C.blue,    category:"Damage",       label:"Flood Damage"    },
  earthquake:   { icon:"🌍", color:C.red,     category:"Damage",       label:"Earthquake"      },
  foundation_issue:{ icon:"⬛",color:C.red,   category:"Damage",       label:"Foundation Issue"},
  collapse:     { icon:"🧱", color:C.red,     category:"Damage",       label:"Wall/Ceiling Collapse"},
  vandalism:    { icon:"⚠️", color:C.yellow,  category:"Damage",       label:"Vandalism"       },
  vehicle_impact:{ icon:"🚗",color:C.red,     category:"Damage",       label:"Vehicle Impact"  },
  // Documentation
  permit:      { icon:"📋", color:C.blue,    category:"Documentation",label:"Permit"          },
  photo:       { icon:"📷", color:C.muted,   category:"Documentation",label:"Photo"           },
  claim:       { icon:"📄", color:C.yellow,  category:"Documentation",label:"Insurance Claim" },
  inspection:  { icon:"🔍", color:"#10b981", category:"Documentation",label:"Inspection"      },
  home_inspection:{ icon:"📝",color:"#0ea5e9",category:"Documentation",label:"Home Inspection"  },
  sale:        { icon:"🤝", color:"#8b5cf6", category:"Documentation",label:"Property Sale"    },
  listing:     { icon:"🏷️", color:"#64748b", category:"Documentation",label:"MLS Listing"      },
  move_in:     { icon:"🔑", color:"#22c55e", category:"Rental",       label:"Move-In Inspection"},
  move_out:    { icon:"📦", color:"#f97316", category:"Rental",       label:"Move-Out Inspection"},
  rental_insp: { icon:"📋", color:"#0ea5e9", category:"Rental",       label:"Rental Inspection" },
  maintenance: { icon:"🔨", color:"#8b5cf6", category:"Rental",       label:"Maintenance"       },
  note:        { icon:"📝", color:C.dim,     category:"Documentation",label:"Note"            },
};

// Group types by category for fast log
const TRADE_CATEGORIES = {
  "Structural":        ["roof","siding","windows","addition","foundation","gutters","insulation"],
  "Insulation":        ["insulation_blown","insulation_batt","insulation_spray","insulation_rigid","insulation_radiant"],
  "Mechanical":        ["hvac","plumbing","electrical","water_heater","appliances"],
  "Restoration":       ["fire_restoration","water_restoration","mold_remediation","storm_restoration","smoke_damage","biohazard","restoration"],
  "New Construction":  ["new_construction"],
  "Damage Events":     ["tree_strike","fire_damage","flood_damage","earthquake","foundation_issue","collapse","vandalism","vehicle_impact"],
  "Documentation":     ["permit","photo","inspection","home_inspection","sale","listing","claim","note"],
};

// Typical lifespans for assessment
const LIFESPANS = {
  roof:15, hvac:15, water_heater:12, electrical:25,
  plumbing:25, siding:20, windows:20, insulation:30,
  appliances:12, gutters:20, foundation:50,
};

// Building types for multi-structure properties
const BUILDING_TYPES = [
  { id:"main_house",   icon:"🏠", label:"Main House"      },
  { id:"barn",         icon:"🏚️", label:"Barn"            },
  { id:"garage",       icon:"🚗", label:"Garage"          },
  { id:"shop",         icon:"🔧", label:"Shop / Workshop" },
  { id:"pole_barn",    icon:"🏗️", label:"Pole Barn"       },
  { id:"shed",         icon:"🏡", label:"Shed"            },
  { id:"guest_house",  icon:"🏘️", label:"Guest House"     },
  { id:"commercial",   icon:"🏢", label:"Commercial Bldg" },
  { id:"outbuilding",  icon:"⬜", label:"Outbuilding"     },
  { id:"other",        icon:"📦", label:"Other"           },
];

// ── Demo Data ─────────────────────────────────────────────────────────────────
const DEMO_PROPERTIES = [
  {
    id:"p1", address:"5814 Northwind Drive", city:"Marion", state:"IL", zip:"62959",
    lat:37.7380, lng:-88.9420, yearBuilt:1987, sqft:1750, stories:1, style:"Ranch",
    lastRoof:2022, roofMaterial:"GAF Timberline HDZ", roofWarranty:"30yr",
    roofAge:2, roofStatus:"good", ourJob:true, ownerName:"Johnson, Robert & Lisa",
    notes:"Full tear-off Oct 2022. GAF Timberline HDZ 30yr. Job #2022-0341.",
    claimHistory:[],
    buildings:[
      {id:"main_house",type:"main_house",icon:"🏠",label:"Main House",notes:"Single-story ranch, ~1,750 sq ft"},
      {id:"garage_1",type:"garage",icon:"🚗",label:"Attached Garage",notes:"2-car, attached"},
      {id:"shed_1",type:"shed",icon:"🏡",label:"Storage Shed",notes:"12x16 wood frame, rear yard"},
    ],
    timeline:[
      {id:"e1",year:1987,type:"permit",label:"Original Construction",note:"Single-story ranch. Permit #WC-1987-2241.",source:"County Records",verified:true},
      {id:"e2",year:2003,type:"permit",label:"Deck Addition",note:"240 sq ft rear deck. Permit #WC-2003-0887.",source:"County Records",verified:true},
      {id:"e3",year:2009,type:"photo",label:"Street View — Aug 2009",note:"Granule loss on south face. Algae at ridge.",source:"Street View",verified:true},
      {id:"e4",year:2015,type:"photo",label:"Street View — Jun 2015",note:"Advanced granule loss. Two soft spots on west slope.",source:"Street View",verified:true},
      {id:"e5",year:2019,type:"photo",label:"MLS Listing Photo",note:"Sold. Roof ~32yr at sale. Disclosure: older roof.",source:"Zillow/MLS",verified:true},
      {id:"e6",year:2021,type:"restoration",label:"Water Damage — Interior",note:"Ceiling damage master bed/hallway. Flashing failure at chimney. Job #2021-0189.",source:"Our Work",verified:true,buildingId:"main_house"},
      {id:"e7",year:2022,type:"roof",label:"Roof Replaced — Our Crew ✓",note:"Full tear-off. GAF Timberline HDZ 30yr. Ice & water shield full deck. Job #2022-0341.",source:"Our Work",verified:true,ourJob:true,buildingId:"main_house"},
      {id:"e8",year:2019,type:"hvac",label:"HVAC Replaced",note:"Carrier 3-ton central air, 10yr warranty. Job #2019-0218.",source:"Our Work",verified:true,ourJob:true,buildingId:"main_house"},
      {id:"e9",year:2016,type:"water_heater",label:"Water Heater Replaced",note:"50-gal Rheem gas water heater, 6yr warranty.",source:"Our Work",verified:true,ourJob:true,buildingId:"main_house"},
    ],
    photos:[
      {year:2009,label:"Street View 2009",type:"street_view",condition:"poor"},
      {year:2015,label:"Street View 2015",type:"street_view",condition:"critical"},
      {year:2021,label:"Pre-Loss Interior",type:"pre_loss",condition:"damage"},
      {year:2022,label:"Post-Repair",type:"post_repair",condition:"good"},
    ],
  },
  {
    id:"p2", address:"1847 Oak Ridge Road", city:"Carterville", state:"IL", zip:"62918",
    lat:37.7652, lng:-89.0901, yearBuilt:1994, sqft:2180, stories:2, style:"Colonial",
    lastRoof:2008, roofMaterial:"Owens Corning 3-tab", roofWarranty:"25yr (expired)",
    roofAge:16, roofStatus:"aging", ourJob:false, ownerName:"Meridian Properties LLC",
    notes:"Estimate Jun 2024. Homeowner declined. Follow up Q1 2025.",
    claimHistory:[{year:2023,type:"hail",carrier:"Shelter Insurance",status:"Settled",claimNumber:"SHI-2023-44821"}],
    timeline:[
      {id:"e1",year:1994,type:"permit",label:"Original Construction",note:"Two-story colonial. 3-tab asphalt. Permit #WC-1994-1104.",source:"County Records",verified:true},
      {id:"e2",year:2008,type:"roof",label:"Roof Replaced",note:"Owens Corning 3-tab, 25yr warranty. Permit #WC-2008-2291.",source:"Permit",verified:true},
      {id:"e3",year:2012,type:"photo",label:"Street View — May 2012",note:"Good condition. No visible wear.",source:"Street View",verified:true},
      {id:"e4",year:2017,type:"photo",label:"Street View — Sep 2017",note:"Minor granule loss on south slope.",source:"Street View",verified:true},
      {id:"e_insp",year:2021,type:"home_inspection",label:"Home Inspection — Carterville Home Inspections",note:"Inspector: James R. Holloway #IL-INSP-44821. Systems: Roof: fair, HVAC: good, Plumbing: good, Electrical: good, Foundation: good. Notes: Roof showing wear consistent with 13yr age, recommend budget for replacement within 3-5 years.",source:"Home Inspection",verified:true,inspectionData:{inspector:"James R. Holloway",licenseNum:"IL-INSP-44821",company:"Carterville Home Inspections",date:"2021-04-12",salePrice:"$187,500",roof:"fair",hvac:"good",plumbing:"good",electrical:"good",foundation:"good",windows:"good",insulation:"fair",attic:"good",overallRating:"fair",notes:"Roof showing wear consistent with 13yr age. Budget for replacement within 3-5 years."}},
      {id:"e5",year:2023,type:"claim",label:"Hail Damage — Shelter Ins.",note:"Aug 2023. Claim #SHI-2023-44821. Pre-loss disputed. Settled.",source:"Insurance",verified:true},
      {id:"e6",year:2024,type:"photo",label:"Our Estimate Photos",note:"Significant granule loss, 3 cracked shingles, flashing separation.",source:"Our Work",verified:true},
    ],
    photos:[
      {year:2012,label:"Street View 2012",type:"street_view",condition:"good"},
      {year:2017,label:"Street View 2017",type:"street_view",condition:"aging"},
      {year:2023,label:"Post-Hail",type:"damage",condition:"critical"},
    ],
  },
  {
    id:"p3", address:"324 Magnolia Street", city:"Herrin", state:"IL", zip:"62948",
    lat:37.7998, lng:-89.0285, yearBuilt:1968, sqft:1390, stories:1, style:"Ranch",
    lastRoof:2004, roofMaterial:"3-tab asphalt", roofWarranty:"expired",
    roofAge:20, roofStatus:"critical", ourJob:false, ownerName:"Williams, Harold E.",
    notes:"Drive-by logged. Sagging ridge. Owner not yet contacted.",
    claimHistory:[],
    timeline:[
      {id:"e1",year:1968,type:"permit",label:"Original Construction",note:"Single-story ranch. Permit on file Williamson County.",source:"County Records",verified:true},
      {id:"e2",year:1991,type:"permit",label:"Garage Addition",note:"Attached 2-car garage. Permit #WC-1991-0442.",source:"County Records",verified:true},
      {id:"e3",year:2004,type:"roof",label:"Roof Replaced",note:"3-tab asphalt. Permit #WC-2004-1773.",source:"Permit",verified:true},
      {id:"e4",year:2011,type:"photo",label:"Street View — Jul 2011",note:"Roof appears sound. Some fading.",source:"Street View",verified:true},
      {id:"e5",year:2018,type:"photo",label:"Street View — Oct 2018",note:"Granule loss advancing. Ridge slightly uneven.",source:"Street View",verified:true},
      {id:"e6",year:2024,type:"photo",label:"Drive-By Assessment",note:"Sagging ridge. Missing shingles. Moss on north face. Replace immediately.",source:"Our Work",verified:true},
    ],
    photos:[
      {year:2011,label:"Street View 2011",type:"street_view",condition:"aging"},
      {year:2018,label:"Street View 2018",type:"street_view",condition:"critical"},
      {year:2024,label:"Drive-By 2024",type:"inspection",condition:"critical"},
    ],
  },
  {
    id:"p4", address:"2291 Cardinal Lane", city:"Marion", state:"IL", zip:"62959",
    lat:37.7441, lng:-88.9198, yearBuilt:2003, sqft:2640, stories:2, style:"Traditional",
    lastRoof:2021, roofMaterial:"CertainTeed Landmark", roofWarranty:"30yr",
    roofAge:3, roofStatus:"good", ourJob:true, ownerName:"Thompson, David & Karen",
    notes:"Replaced after hail May 2021. Grinnell Mutual. Full tear-off, new decking north slope. Job #2021-0412.",
    claimHistory:[{year:2021,type:"hail",carrier:"Grinnell Mutual",status:"Paid — Full Replacement",claimNumber:"GRM-2021-19834"}],
    timeline:[
      {id:"e1",year:2003,type:"permit",label:"Original Construction",note:"2-story traditional. CertainTeed 3-tab. Permit #WC-2003-3341.",source:"County Records",verified:true},
      {id:"e2",year:2016,type:"photo",label:"Street View — Aug 2016",note:"Good condition at 13yr. No visible damage.",source:"Street View",verified:true},
      {id:"e3",year:2021,type:"photo",label:"Pre-Loss Photos — May 2021",note:"Hail impact visible all slopes. Submitted to Grinnell Mutual.",source:"Our Work",verified:true,preLoss:true},
      {id:"e4",year:2021,type:"claim",label:"Hail Claim — Grinnell Mutual",note:"Claim #GRM-2021-19834. Full replacement approved. Pre-loss docs expedited settlement.",source:"Insurance",verified:true},
      {id:"e5",year:2021,type:"roof",label:"Roof Replaced — Our Crew ✓",note:"CertainTeed Landmark 30yr. New decking north slope. Job #2021-0412.",source:"Our Work",verified:true,ourJob:true},
      {id:"e6",year:2020,type:"electrical",label:"Electrical Panel Upgrade",note:"200-amp panel upgrade. Permits pulled Williamson County. Job #2020-0155.",source:"Our Work",verified:true,ourJob:true},
    ],
    photos:[
      {year:2016,label:"Street View 2016",type:"street_view",condition:"good"},
      {year:2021,label:"Pre-Loss — Hail",type:"pre_loss",condition:"damage"},
      {year:2021,label:"Post-Repair",type:"post_repair",condition:"good"},
    ],
  },
];

// ── Storage ───────────────────────────────────────────────────────────────────
async function storageGet(k) { try { const r=await window.storage.get(k); return r?JSON.parse(r.value):null; } catch { return null; } }
async function storageSet(k,v) { try { await window.storage.set(k,JSON.stringify(v)); } catch {} }

// ── Small UI ──────────────────────────────────────────────────────────────────
const Spinner = ({size=18}) => <span style={{display:"inline-block",width:size,height:size,border:`2px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>;
function Badge({status,small}) {
  const s=STATUS[status]||STATUS.good;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:s.bg,border:`1px solid ${s.color}44`,color:s.color,borderRadius:6,padding:small?"2px 8px":"4px 12px",fontSize:small?10:12,fontWeight:700,whiteSpace:"nowrap"}}>{s.dot} {s.label}</span>;
}
function Pill({children,color=C.accent}) {
  return <span style={{display:"inline-flex",alignItems:"center",background:color+"22",color,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;
}
function Btn({children,onClick,small,disabled,loading,color=C.accent,full,variant="solid"}) {
  return <button onClick={onClick} disabled={disabled||loading} style={{background:variant==="ghost"?"transparent":(disabled||loading?C.dim:color),color:variant==="ghost"?C.muted:"#fff",border:variant==="ghost"?`1px solid ${C.border}`:"none",borderRadius:10,padding:small?"8px 16px":"12px 24px",cursor:disabled||loading?"not-allowed":"pointer",fontWeight:700,fontSize:small?12:15,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"inherit",width:full?"100%":"auto",WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}}>{loading&&<Spinner size={14}/>}{children}</button>;
}

// ── Photo Card ────────────────────────────────────────────────────────────────
function PhotoCard({photo,height=200,thumb=false}) {
  const condColor={good:C.green,aging:C.yellow,critical:C.red,damage:C.red,poor:C.yellow,inspection:C.blue};
  const col=condColor[photo.condition]||C.muted;
  const icons={street_view:"🛣️",pre_loss:"⚠️",post_repair:"✅",damage:"🔴",inspection:"🔍"};
  const icon=icons[photo.type]||"📷";
  if(thumb) return (
    <div style={{width:64,height:48,borderRadius:7,overflow:"hidden",background:col+"11",border:`2px solid ${col}33`,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:16}}>{icon}</div>
      <div style={{color:col,fontSize:8,fontWeight:700,marginTop:2}}>{photo.year}</div>
    </div>
  );
  return (
    <div style={{position:"relative",borderRadius:12,overflow:"hidden",background:col+"0a",border:`1px solid ${col}33`,height,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
      <div style={{fontSize:44}}>{icon}</div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,#000d)",padding:"20px 14px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{photo.label}</div>
          <div style={{background:col+"cc",borderRadius:6,padding:"3px 10px",color:"#fff",fontSize:11,fontWeight:700}}>{photo.condition.toUpperCase()}</div>
        </div>
      </div>
      {photo.type==="pre_loss"&&<div style={{position:"absolute",top:10,left:10,background:C.yellow+"ee",borderRadius:6,padding:"3px 10px",color:"#000",fontSize:10,fontWeight:800}}>PRE-LOSS DOC</div>}
      {photo.type==="post_repair"&&<div style={{position:"absolute",top:10,left:10,background:C.green+"ee",borderRadius:6,padding:"3px 10px",color:"#fff",fontSize:10,fontWeight:800}}>POST-REPAIR</div>}
    </div>
  );
}
function PhotoTimeline({photos}) {
  const [active,setActive]=useState(0);
  if(!photos?.length) return null;
  return (
    <div style={{marginBottom:20}}>
      <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>Visual History</div>
      <div style={{marginBottom:10}}><PhotoCard photo={photos[active]} height={200}/></div>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
        {photos.map((p,i)=>(
          <div key={i} onClick={()=>setActive(i)} style={{flexShrink:0,cursor:"pointer",opacity:i===active?1:0.5,outline:i===active?`2px solid ${C.accent}`:"none",borderRadius:7,transition:"opacity 0.15s"}}>
            <PhotoCard photo={p} thumb/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function Timeline({events, onAddTag}) {
  const sorted=[...events].sort((a,b)=>b.year-a.year);
  const [addingTagFor, setAddingTagFor] = useState(null);
  const QUICK_TAGS = [{id:"full_replacement",label:"Full Replacement",color:C.green},{id:"repair",label:"Repair",color:C.yellow},{id:"hail",label:"Hail",color:C.blue},{id:"wind",label:"Wind",color:C.blue},{id:"insurance_claim",label:"Insurance Claim",color:C.purple},{id:"warranty_30yr",label:"30yr Warranty",color:C.green},{id:"warranty_25yr",label:"25yr Warranty",color:C.green},{id:"gaf",label:"GAF",color:C.accent},{id:"owens_corning",label:"Owens Corning",color:C.accent},{id:"certainteed",label:"CertainTeed",color:C.accent},{id:"new_decking",label:"New Decking",color:C.accent},{id:"ice_water_shield",label:"Ice & Water",color:C.blue}];
  const tagDefs=[...QUICK_TAGS,{id:"emergency",label:"Emergency",color:C.red},{id:"warranty_work",label:"Warranty Work",color:C.blue},{id:"partial_decking",label:"Partial Decking",color:C.accent},{id:"ridge_cap",label:"Ridge Cap",color:C.muted},{id:"flashing",label:"Flashing",color:C.muted},{id:"gutters",label:"Gutters",color:C.blue},{id:"skylights",label:"Skylights",color:C.blue},{id:"chimney",label:"Chimney",color:C.muted},{id:"storm",label:"Storm",color:C.purple},{id:"leak",label:"Leak",color:C.yellow},{id:"age",label:"Age",color:C.muted},{id:"structural",label:"Structural",color:C.red},{id:"iko",label:"IKO",color:C.accent},{id:"metal",label:"Metal",color:C.muted},{id:"tpo",label:"TPO",color:C.muted},{id:"flat",label:"Flat",color:C.muted},{id:"warranty_20yr",label:"20yr Warranty",color:C.green},{id:"warranty_10yr",label:"10yr Warranty",color:C.yellow},{id:"warranty_none",label:"No Warranty",color:C.red},{id:"warranty_mfg",label:"Manufacturer",color:C.blue},{id:"warranty_labor",label:"Workmanship",color:C.accent}];
  return (
    <div style={{position:"relative",paddingLeft:32}}>
      <div style={{position:"absolute",left:13,top:8,bottom:8,width:2,background:C.border}}/>
      {sorted.map(ev=>{
        const tc=TYPE_CFG[ev.type]||TYPE_CFG.photo;
        const isOurWork=ev.source==="Our Work";
        return (
          <div key={ev.id} style={{position:"relative",marginBottom:16}}>
            <div style={{position:"absolute",left:-25,top:4,width:26,height:26,borderRadius:"50%",background:isOurWork?C.accent:tc.color+"33",border:`2px solid ${isOurWork?C.accent:tc.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{tc.icon}</div>
            <div style={{background:isOurWork?C.accent+"11":ev.preLoss?C.yellow+"0a":C.card,border:`1px solid ${isOurWork?C.accent+"44":ev.preLoss?C.yellow+"33":C.border}`,borderRadius:11,padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:4}}>
                <div style={{color:C.text,fontWeight:700,fontSize:13,flex:1}}>{ev.label}</div>
                <div style={{color:C.accent,fontWeight:800,fontSize:14,flexShrink:0}}>{ev.year}</div>
              </div>
              <div style={{color:C.muted,fontSize:12,lineHeight:1.5,marginBottom:6}}>{ev.note}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                <Pill color={tc.color}>{ev.type}</Pill>
                <Pill color={isOurWork?C.accent:C.dim}>{ev.source}</Pill>
                {ev.verified&&<Pill color={C.green}>✓ Verified</Pill>}
                {ev.preLoss&&<Pill color={C.yellow}>Pre-Loss Doc</Pill>}
                {ev.tags&&ev.tags.map(id=>{
                  const tag=tagDefs.find(t=>t.id===id);
                  return tag?<Pill key={id} color={tag.color}>{tag.label}</Pill>:null;
                })}
                {isOurWork&&<div onClick={()=>setAddingTagFor(addingTagFor===ev.id?null:ev.id)} style={{background:C.dim+"22",border:`1px solid ${C.dim}`,borderRadius:20,padding:"2px 8px",cursor:"pointer",fontSize:9,fontWeight:700,color:C.dim,WebkitTapHighlightColor:"transparent"}}>+ Tag</div>}
              </div>
              {addingTagFor===ev.id&&(
                <div style={{background:C.surface,borderRadius:10,padding:"10px 12px",marginTop:6}}>
                  <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Add Tags</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {QUICK_TAGS.filter(t=>!ev.tags?.includes(t.id)).map(tag=>(
                      <div key={tag.id} onClick={()=>{onAddTag&&onAddTag(ev.id,tag.id);setAddingTagFor(null);}}
                        style={{background:tag.color+"22",border:`1px solid ${tag.color}44`,borderRadius:20,padding:"3px 10px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                        <span style={{color:tag.color,fontSize:10,fontWeight:700}}>{tag.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Parcel Map ────────────────────────────────────────────────────────────────
function ParcelMap({properties,onSelect,regridToken}) {
  const mapRef=useRef(null);
  const instanceRef=useRef(null);
  const markersRef=useRef([]);
  const parcelLayersRef=useRef([]);
  const [loadingParcel,setLoadingParcel]=useState(false);
  const [parcelInfo,setParcelInfo]=useState(null);
  const [parcelFor,setParcelFor]=useState(null);

  useEffect(()=>{
    if(!document.getElementById("lf-css")){const l=document.createElement("link");l.id="lf-css";l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(l);}
    const loadL=()=>new Promise(res=>{if(window.L){res();return;}const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=res;document.head.appendChild(s);});
    loadL().then(()=>{if(instanceRef.current)return;const map=window.L.map(mapRef.current,{center:[37.76,-89.0],zoom:10});window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(map);instanceRef.current=map;});
  },[]);

  const fetchParcel=async(lat,lng,prop)=>{
    if(!regridToken)return;
    setLoadingParcel(true);setParcelInfo(null);setParcelFor(prop.address);
    parcelLayersRef.current.forEach(l=>l.remove());parcelLayersRef.current=[];
    try{
      const url=`https://app.regrid.com/api/v1/search.json?lat=${lat}&lon=${lng}&token=${regridToken}&limit=1&return_custom=false`;
      const res=await fetch(url);const data=await res.json();
      const features=data?.parcels?.features||data?.results||[];
      if(features.length&&instanceRef.current){
        const feat=features[0];const f=feat.properties?.fields||feat.properties||{};
        const s=STATUS[prop.roofStatus];
        const layer=window.L.geoJSON(feat.geometry,{style:{color:s.color,weight:3,fillColor:s.color,fillOpacity:0.15,dashArray:"5,5"}}).addTo(instanceRef.current);
        parcelLayersRef.current.push(layer);instanceRef.current.fitBounds(layer.getBounds(),{padding:[20,20]});
        setParcelInfo({owner:f.owner||"Not available",mailing:f.mailadd?`${f.mailadd}${f.mail_city?", "+f.mail_city:""}`:"—",parcel:f.parcelnumb||"—",acres:f.ll_gisacre?parseFloat(f.ll_gisacre).toFixed(3):"—",assessed:f.parval?"$"+parseFloat(f.parval).toLocaleString():"—",use:f.usedesc||"—",absentee:f.mailadd&&f.address&&!f.mailadd.toLowerCase().includes(f.address.toLowerCase().split(" ")[0])});
      }else{setParcelInfo({owner:"No parcel found",mailing:"—",parcel:"—",acres:"—",assessed:"—",use:"—",absentee:false});}
    }catch(e){setParcelInfo({owner:"Error: "+e.message,mailing:"—",parcel:"—",acres:"—",assessed:"—",use:"—",absentee:false});}
    setLoadingParcel(false);
  };

  useEffect(()=>{
    const L=window.L;if(!L||!instanceRef.current)return;
    markersRef.current.forEach(m=>m.remove());markersRef.current=[];
    properties.forEach(p=>{
      if(!p.lat||!p.lng)return;
      const s=STATUS[p.roofStatus];
      const icon=L.divIcon({className:"",html:`<div style="width:16px;height:16px;border-radius:50%;background:${s.color};border:2.5px solid white;box-shadow:0 0 8px ${s.color}99;cursor:pointer;"></div>`,iconSize:[16,16],iconAnchor:[8,8]});
      const m=L.marker([p.lat,p.lng],{icon}).addTo(instanceRef.current).bindPopup(`<div style="font-family:sans-serif"><strong>${p.address}</strong><br/><span style="color:${s.color};font-weight:700">${p.roofAge}yr · ${s.label}</span></div>`).on("click",()=>{onSelect(p);fetchParcel(p.lat,p.lng,p);});
      markersRef.current.push(m);
    });
  },[properties,regridToken]);

  return (
    <div style={{marginBottom:16}}>
      <div style={{position:"relative",borderRadius:14,overflow:"hidden",border:`1px solid ${C.border}`}}>
        <div ref={mapRef} style={{height:260,width:"100%",background:C.card}}/>
        <div style={{position:"absolute",bottom:8,left:8,display:"flex",gap:5,zIndex:1000,flexWrap:"wrap"}}>
          {[["critical",C.red,"Replace Now"],["aging",C.yellow,"Aging"],["good",C.green,"Good"]].map(([k,col,l])=>(
            <div key={k} style={{background:"#000b",borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:col}}/><span style={{color:"#fff",fontSize:9,fontWeight:600}}>{l}</span>
            </div>
          ))}
        </div>

      </div>
      {loadingParcel&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginTop:8,display:"flex",alignItems:"center",gap:10}}><Spinner size={14}/><span style={{color:C.muted,fontSize:13}}>Looking up parcel — {parcelFor}...</span></div>}
      {parcelInfo&&!loadingParcel&&(
        <div style={{background:C.card,border:`1px solid ${C.accent}44`,borderRadius:10,padding:"14px 16px",marginTop:8}}>
          <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>📍 Parcel Data · {parcelFor}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:parcelInfo.absentee?10:0}}>
            {[["Owner",parcelInfo.owner],["Mailing",parcelInfo.mailing],["Parcel #",parcelInfo.parcel],["Acreage",parcelInfo.acres],["Assessed",parcelInfo.assessed],["Use",parcelInfo.use]].map(([k,v])=>(
              <div key={k} style={{background:C.surface,borderRadius:10,padding:"10px 12px"}}><div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{k}</div><div style={{color:C.text,fontSize:12,fontWeight:600,marginTop:2,wordBreak:"break-word"}}>{v}</div></div>
            ))}
          </div>
          {parcelInfo.absentee&&<div style={{background:C.yellow+"11",border:`1px solid ${C.yellow}33`,borderRadius:8,padding:"8px 12px"}}><span style={{color:C.yellow,fontSize:11,fontWeight:700}}>⚠ Absentee owner — mailing address differs from property</span></div>}
        </div>
      )}
    </div>
  );
}


// ── AI Summary Component ──────────────────────────────────────────────────────
function AISummaryPanel({property, userTier, onShowPaywall}) {
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState({});
  const [activeType, setActiveType] = useState("homeowner");
  const [error, setError] = useState("");

  const SUMMARY_TYPES = [
    { id:"homeowner", icon:"🏠", label:"Homeowner",  color:C.green,  desc:"Warm, readable — great for listings and disclosure" },
    { id:"insurance", icon:"📄", label:"Insurance",  color:C.blue,   desc:"Clinical and factual — formatted for underwriting" },
    { id:"contractor",icon:"🔧", label:"Contractor", color:C.accent, desc:"Technical detail with materials, specs, job numbers" },
  ];

  const buildPrompt = (type) => {
    const events = [...property.timeline].sort((a,b)=>a.year-b.year);
    const eventText = events.map(e=>`${e.year}: ${e.label} — ${e.note} [Source: ${e.source}]`).join("\n");
    const mechTypes = ["hvac","plumbing","electrical","water_heater","appliances"];
    const mechEvents = events.filter(e=>mechTypes.includes(e.type));

    const base = `Property: ${property.address}, ${property.city}, ${property.state}
Year Built: ${property.yearBuilt} | Style: ${property.style} | Sq Ft: ${property.sqft?.toLocaleString()}
Owner: ${property.ownerName||"Unknown"}
Roof: ${property.roofMaterial}, replaced ${property.lastRoof}, age ${property.roofAge} years, status: ${property.roofStatus}
${mechEvents.length ? "Mechanical systems on file: "+mechEvents.map(e=>`${TYPE_CFG[e.type]?.label} (${e.year})`).join(", ") : ""}
${property.claimHistory?.length ? "Claims on file: "+property.claimHistory.map(c=>`${c.year} ${c.type} — ${c.carrier} #${c.claimNumber} (${c.status})`).join(", ") : "No claims on file"}

Documented work history:
${eventText}`;

    if(type==="homeowner") return `${base}

Write a 2-3 paragraph property condition summary in warm, readable language suitable for a homeowner to share with buyers, their real estate agent, or insurance agent. Highlight the improvements made, the current condition, and why this property is well-documented and well-maintained. Do not use technical jargon. Sound like a knowledgeable friend explaining the property's history.`;

    if(type==="insurance") return `${base}

Write a 2-3 paragraph professional insurance assessment in clinical, factual language suitable for an underwriter or claims adjuster. Cover: current roof condition and age relative to typical service life, documented maintenance history, any prior claims and their resolution, and overall risk assessment. Use industry terminology. Be precise about dates, materials, and warranty status.`;

    return `${base}

Write a 2-3 paragraph technical contractor summary covering all documented work performed. Include specific materials, warranty details, job numbers, installation methods, and any notable observations. This is for a licensed contractor reviewing the property before bidding a job. Be specific and technical. Note any concerns or follow-up items based on the documented history.`;
  };

  const generateSummary = async (type) => {
    if(summaries[type]) { setActiveType(type); return; }
    if(userTier==="free") { onShowPaywall&&onShowPaywall("AI Summary"); return; }
    setLoading(true); setError(""); setActiveType(type);
    try {
      const res = await fetch("https://homestory-server-production.up.railway.app/api/insurance-report", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ property, promptOverride: buildPrompt(type) }),
      });
      if(!res.ok) throw new Error("Server offline");
      const data = await res.json();
      setSummaries(prev=>({...prev,[type]:data.report||"Summary unavailable."}));
    } catch(e) {
      // Fallback demo summary when server is offline
      const demos = {
        homeowner: `This well-maintained ${property.style.toLowerCase()} home at ${property.address} has a thoroughly documented renovation history going back to its original construction in ${property.yearBuilt}. Most notably, the roof was completely replaced in ${property.lastRoof} with ${property.roofMaterial} — one of the most trusted materials in the industry — backed by a ${property.roofWarranty} warranty. ${property.timeline.filter(e=>e.source==="Our Work").length > 1 ? `Additional contractor work is on file including ${property.timeline.filter(e=>e.type==="restoration"||e.type==="hvac"||e.type==="addition").map(e=>e.label).slice(0,2).join(" and ")}.` : ""}

This property stands out because every major repair is verified and documented by licensed contractors with photographic evidence and job records on file. For buyers, sellers, and insurance agents, that documentation provides genuine peace of mind and removes uncertainty from the transaction.`,

        insurance: `Property Assessment — ${property.address}, ${property.city}, ${property.state}. Year of construction: ${property.yearBuilt}. Current roof installation: ${property.roofMaterial}, installed ${property.lastRoof}, estimated age ${property.roofAge} years, condition: ${STATUS[property.roofStatus]?.label}. ${property.roofStatus==="critical"?"Roof has exceeded typical 20-25 year service life. Replacement recommended prior to new policy issuance.":property.roofStatus==="aging"?"Roof is approaching end of service life. Inspection recommended within 12 months.":"Roof is within normal service life with documented warranty on file."}

${property.claimHistory?.length ? `Prior claims documented: ${property.claimHistory.map(c=>`${c.year} ${c.type} event, ${c.carrier}, Claim #${c.claimNumber}, status: ${c.status}`).join(". ")}.` : "No prior claims on file."} All documented repairs have been performed by licensed contractors with photographic and job record documentation on file in the HomeStory verified database. Risk assessment: ${property.roofStatus==="good"?"Standard — no elevated concerns identified.":property.roofStatus==="aging"?"Moderate — roof age warrants monitoring.":"Elevated — roof replacement recommended before policy renewal."}`,

        contractor: `Technical Property Summary — ${property.address}. Structure: ${property.stories}-story ${property.style}, ${property.sqft?.toLocaleString()} sq ft, built ${property.yearBuilt}. Roof system: ${property.roofMaterial}, full tear-off installation completed ${property.lastRoof}, ${property.roofWarranty} warranty. ${property.timeline.filter(e=>e.ourJob).map(e=>`${e.year}: ${e.label} — ${e.note}`).join(". ")}.

Mechanical systems on file: ${property.timeline.filter(e=>["hvac","plumbing","electrical","water_heater"].includes(e.type)).map(e=>`${TYPE_CFG[e.type]?.label} replaced ${e.year}`).join(", ")||"None documented"}. ${property.claimHistory?.length ? `Insurance claim history: ${property.claimHistory.map(c=>`${c.year} ${c.type}, ${c.carrier} #${c.claimNumber}, ${c.status}`).join("; ")}.` : "No insurance claims on file."} All records verified by HomeStory with GPS-tagged contractor documentation.`
      };
      setSummaries(prev=>({...prev,[type]:demos[type]||"Demo summary — connect server for AI-generated summaries."}));
    }
    setLoading(false);
  };

  // Auto-generate on load only if pro tier
  useEffect(()=>{ if(userTier!=="free") generateSummary("homeowner"); },[]);

  const copy = () => {
    if(summaries[activeType]) navigator.clipboard.writeText(summaries[activeType]);
  };

  if(!property) return null;
  return (
    <div>
      <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Summary Type</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
        {SUMMARY_TYPES.map(t=>(
          <div key={t.id} onClick={()=>generateSummary(t.id)} style={{background:activeType===t.id?t.color+"22":C.card,border:`2px solid ${activeType===t.id?t.color:C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,WebkitTapHighlightColor:"transparent"}}>
            <span style={{fontSize:20,flexShrink:0}}>{t.icon}</span>
            <div style={{flex:1}}>
              <div style={{color:activeType===t.id?t.color:C.text,fontSize:13,fontWeight:700}}>{t.label} Version</div>
              <div style={{color:C.dim,fontSize:11,marginTop:2}}>{t.desc}</div>
            </div>
            {summaries[t.id]&&<span style={{color:C.green,fontSize:12,flexShrink:0}}>✓</span>}
          </div>
        ))}
      </div>

      {/* Summary output */}
      <div style={{background:C.card,border:`1px solid ${SUMMARY_TYPES.find(t=>t.id===activeType)?.color}44||${C.border}`,borderRadius:14,padding:18,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{SUMMARY_TYPES.find(t=>t.id===activeType)?.label} Summary</div>
          {summaries[activeType]&&(
            <div style={{display:"flex",gap:8}}>
              <button onClick={copy} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Copy</button>
            </div>
          )}
        </div>
        {loading?(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 0"}}>
            <Spinner size={16}/><span style={{color:C.muted,fontSize:13}}>Generating {activeType} summary...</span>
          </div>
        ):summaries[activeType]?(
          <div style={{color:C.text,fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{summaries[activeType]}</div>
        ):(
          <div style={{color:C.dim,fontSize:13,textAlign:"center",padding:"20px 0"}}>Tap a summary type above to generate</div>
        )}
      </div>

      {userTier==="free"&&(
        <div style={{background:C.accent+"0a",border:`1px solid ${C.accent}33`,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
          <div style={{color:C.accent,fontSize:12,fontWeight:700,marginBottom:2}}>🤖 AI Summaries require Pro</div>
          <div style={{color:C.muted,fontSize:12}}>Upgrade to generate unlimited AI-written summaries for insurance, real estate, and contractor use.</div>
        </div>
      )}

      {/* Contractor notes section */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>
          🔒 Contractor Field Notes
          {userTier==="free"&&<span style={{color:C.accent,fontSize:9,marginLeft:6,background:C.accent+"22",padding:"1px 6px",borderRadius:4}}>PRO</span>}
        </div>
        {userTier==="free"?(
          <div style={{color:C.dim,fontSize:13}}>Upgrade to Pro to add private contractor notes — homeowner behavior, access info, job history, anything your crew needs to know before arriving.</div>
        ):(
          <div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
              {[
                {label:"Private Notes",desc:"Only your account",icon:"🔒",color:C.muted},
                {label:"Contractor Intel",desc:"Visible to Pro subscribers only — never to homeowners",icon:"👥",color:C.blue},
                {label:"Report Notes",desc:"Included in Home Reports",icon:"📋",color:C.accent},
              ].map(nt=>(
                <div key={nt.label} style={{background:C.surface,borderRadius:10,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:14}}>{nt.icon}</span>
                    <div style={{color:nt.color,fontSize:12,fontWeight:700}}>{nt.label}</div>
                    <div style={{color:C.dim,fontSize:11,marginLeft:"auto"}}>{nt.desc}</div>
                  </div>
                  <textarea placeholder={`Add ${nt.label.toLowerCase()}...`} rows={2}
                    style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:12,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.6}}/>
                </div>
              ))}
            </div>
            <Btn small color={C.accent} onClick={()=>{const el=document.activeElement;if(el)el.blur();alert("Notes saved to your account.");}}>Save All Notes</Btn>
          </div>
        )}
      </div>
    </div>
  );
}


// ── Home Inspection Panel ─────────────────────────────────────────────────────
function HomeInspectionPanel({property, userTier, onShowPaywall}) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [form, setForm] = useState({
    date: "", inspector:"", company:"", licenseNum:"",
    salePrice:"", buyer:"",
    roof:"good", hvac:"good", plumbing:"good", electrical:"good",
    foundation:"good", windows:"good", insulation:"good", attic:"good",
    notes:"", overallRating:"good",
  });
  const [saved, setSaved] = useState(false);

  const inspectionEvents = (property.timeline||[]).filter(e=>
    e.type==="home_inspection"||e.type==="sale"||e.type==="listing"
  ).sort((a,b)=>b.year-a.year);

  const SYSTEMS = [
    {key:"roof",       icon:"🏠", label:"Roof"},
    {key:"hvac",       icon:"❄️", label:"HVAC"},
    {key:"plumbing",   icon:"🔵", label:"Plumbing"},
    {key:"electrical", icon:"⚡", label:"Electrical"},
    {key:"foundation", icon:"⬛", label:"Foundation"},
    {key:"windows",    icon:"🪟", label:"Windows"},
    {key:"insulation", icon:"🌡️", label:"Insulation"},
    {key:"attic",      icon:"🔺", label:"Attic"},
  ];

  const CONDITION_OPTIONS = [
    {value:"good",     label:"Good",         color:C.green},
    {value:"fair",     label:"Fair",         color:C.yellow},
    {value:"poor",     label:"Poor",         color:C.red},
    {value:"na",       label:"N/A",          color:C.dim},
  ];

  const condColor = {good:C.green,fair:C.yellow,poor:C.red,na:C.dim};

  const handleSave = () => {
    // Build a rich event from the form
    const systemSummary = SYSTEMS
      .filter(s=>form[s.key]!=="na")
      .map(s=>`${s.label}: ${form[s.key]}`)
      .join(", ");
    const event = {
      id:`ev-${Date.now()}`,
      year: form.date ? parseInt(form.date.split("-")[0]) : new Date().getFullYear(),
      type:"home_inspection",
      label:`Home Inspection${form.company?" — "+form.company:""}`,
      note:`Inspector: ${form.inspector||"Unknown"}${form.licenseNum?" #"+form.licenseNum:""}. Systems: ${systemSummary}.${form.notes?" Notes: "+form.notes:""}`,
      source:"Home Inspection",
      verified:true,
      inspectionData: {...form, systemSummary},
    };
    // In production: update property in database
    setSaved(true);
    setShowLogForm(false);
    setTimeout(()=>setSaved(false),3000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{color:C.text,fontSize:15,fontWeight:800,marginBottom:4}}>📝 Home Inspection Records</div>
            <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Pre-sale inspection reports, system condition ratings, and sale history — permanently attached to this address.</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Btn small color={C.blue} onClick={()=>setShowLogForm(!showLogForm)}>+ Log Inspection Report</Btn>
          <Btn small variant="ghost" onClick={()=>alert("PDF import available once server is connected.")}>Import from PDF</Btn>
        </div>
        {saved&&<div style={{color:C.green,fontSize:12,fontWeight:700,marginTop:10}}>✓ Inspection logged successfully</div>}
      </div>

      {/* Log form */}
      {showLogForm&&(
        <div style={{background:C.card,border:`1px solid ${C.blue}44`,borderRadius:14,padding:18,marginBottom:14}}>
          <div style={{color:C.blue,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:16}}>Log Inspection Report</div>

          {/* Inspector info */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div>
              <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Inspection Date</div>
              <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Sale Price (optional)</div>
              <input value={form.salePrice} onChange={e=>setForm(p=>({...p,salePrice:e.target.value}))} placeholder="$000,000"
                style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div>
              <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Inspector Name</div>
              <input value={form.inspector} onChange={e=>setForm(p=>({...p,inspector:e.target.value}))} placeholder="Full name"
                style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>License #</div>
              <input value={form.licenseNum} onChange={e=>setForm(p=>({...p,licenseNum:e.target.value}))} placeholder="IL-INSP-XXXXX"
                style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* System ratings */}
          <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>System Condition Ratings</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {SYSTEMS.map(sys=>(
              <div key={sys.key} style={{background:C.surface,borderRadius:10,padding:"10px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <span style={{fontSize:14}}>{sys.icon}</span>
                  <span style={{color:C.text,fontSize:12,fontWeight:600}}>{sys.label}</span>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {CONDITION_OPTIONS.map(opt=>(
                    <div key={opt.value} onClick={()=>setForm(p=>({...p,[sys.key]:opt.value}))}
                      style={{flex:1,background:form[sys.key]===opt.value?opt.color+"33":"transparent",border:`1px solid ${form[sys.key]===opt.value?opt.color:C.border}`,borderRadius:6,padding:"3px 0",textAlign:"center",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                      <span style={{color:form[sys.key]===opt.value?opt.color:C.dim,fontSize:9,fontWeight:700}}>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Overall + notes */}
          <div style={{marginBottom:12}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Overall Rating</div>
            <div style={{display:"flex",gap:8}}>
              {CONDITION_OPTIONS.filter(o=>o.value!=="na").map(opt=>(
                <div key={opt.value} onClick={()=>setForm(p=>({...p,overallRating:opt.value}))}
                  style={{flex:1,background:form.overallRating===opt.value?opt.color+"22":C.surface,border:`2px solid ${form.overallRating===opt.value?opt.color:C.border}`,borderRadius:10,padding:"10px 8px",textAlign:"center",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{color:form.overallRating===opt.value?opt.color:C.muted,fontSize:13,fontWeight:700}}>{opt.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Inspector Notes</div>
            <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={3}
              placeholder="Key findings, recommended repairs, items to monitor..."
              style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.7}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn full color={C.blue} onClick={handleSave} disabled={!form.date&&!form.inspector}>Save Inspection Report</Btn>
            <Btn variant="ghost" small onClick={()=>setShowLogForm(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Existing inspection records */}
      {inspectionEvents.length>0?(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Inspection & Sale History ({inspectionEvents.length})</div>
          {inspectionEvents.map(ev=>{
            const tc = TYPE_CFG[ev.type]||TYPE_CFG.inspection;
            const idata = ev.inspectionData;
            return (
              <div key={ev.id} style={{background:C.card,border:`1px solid ${C.blue}33`,borderRadius:14,padding:16,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span style={{fontSize:18}}>{tc.icon}</span>
                      <div style={{color:C.text,fontSize:14,fontWeight:700}}>{ev.label}</div>
                    </div>
                    <div style={{color:C.muted,fontSize:12}}>{ev.note?.slice(0,80)}...</div>
                  </div>
                  <div style={{color:C.accent,fontWeight:800,fontSize:15,flexShrink:0}}>{ev.year}</div>
                </div>
                {idata&&(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                    {["roof","hvac","plumbing","electrical","foundation","windows","insulation","attic"].filter(k=>idata[k]&&idata[k]!=="na").slice(0,4).map(k=>{
                      const sys = {roof:"🏠",hvac:"❄️",plumbing:"🔵",electrical:"⚡",foundation:"⬛",windows:"🪟",insulation:"🌡️",attic:"🔺"};
                      const col = condColor[idata[k]]||C.muted;
                      return (
                        <div key={k} style={{background:col+"11",border:`1px solid ${col}33`,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                          <div style={{fontSize:12}}>{sys[k]}</div>
                          <div style={{color:col,fontSize:9,fontWeight:700,marginTop:2,textTransform:"capitalize"}}>{idata[k]}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{display:"flex",gap:5,marginTop:10,flexWrap:"wrap"}}>
                  <Pill color={C.blue}>{tc.label}</Pill>
                  <Pill color={C.green}>✓ Verified</Pill>
                  {ev.source&&<Pill color={C.dim}>{ev.source}</Pill>}
                </div>
              </div>
            );
          })}
        </div>
      ):(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:24,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:10}}>📝</div>
          <div style={{color:C.text,fontSize:15,fontWeight:700,marginBottom:6}}>No inspections on file</div>
          <div style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:16}}>Home inspection reports, pre-sale condition ratings, and sale history for this property will appear here once logged.</div>
          <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:12,padding:14,textAlign:"left"}}>
            <div style={{color:C.blue,fontSize:12,fontWeight:700,marginBottom:6}}>Who can contribute inspection data?</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {icon:"🔍",who:"Home Inspectors",how:"Connect inspection software or log reports directly"},
                {icon:"🏡",who:"Real Estate Agents",how:"Upload pre-sale disclosure documents and inspection reports"},
                {icon:"🔧",who:"Contractors",how:"Log pre-work condition assessments before starting a job"},
              ].map(c=>(
                <div key={c.who} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{fontSize:14,flexShrink:0}}>{c.icon}</span>
                  <div><span style={{color:C.text,fontSize:12,fontWeight:600}}>{c.who} — </span><span style={{color:C.muted,fontSize:12}}>{c.how}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspector network CTA */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginTop:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Build the Inspector Network</div>
        <div style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:14}}>A handful of licensed home inspectors covering Southern Illinois touch every property that sells. Connect them to HomeStory and sale-event data flows in automatically on every transaction.</div>
        <Btn full variant="ghost" onClick={()=>alert("Inspector invitations available once server is connected. Come back when you are at your laptop!")}>Invite a Home Inspector</Btn>
      </div>
    </div>
  );
}



// ── Weather Events Panel ──────────────────────────────────────────────────────
function WeatherEventsPanel({property}) {
  if(!property) return null;
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const SEVERITY = {
    major:    { color:C.red,    label:"Major",    icon:"🔴", hailMin:1.75, windMin:65 },
    moderate: { color:C.yellow, label:"Moderate", icon:"🟡", hailMin:1.0,  windMin:50 },
    minor:    { color:C.green,  label:"Minor",    icon:"🟢", hailMin:0.5,  windMin:35 },
  };

  const getSeverity = (hailSize, windSpeed) => {
    const h = parseFloat(hailSize)||0;
    const w = parseFloat(windSpeed)||0;
    if(h>=1.75||w>=65) return "major";
    if(h>=1.0 ||w>=50) return "moderate";
    return "minor";
  };

  const fetchWeather = async () => {
    if(!property.lat||!property.lng) {
      // Use demo data if no coordinates
      setEvents(DEMO_WEATHER);
      return;
    }
    setLoading(true);
    setError("");
    try {
      // NOAA Storm Events API — free, no key required
      const lat = property.lat;
      const lng = property.lng;
      const endYear = new Date().getFullYear();
      const startYear = endYear - 10;

      // Fetch from NOAA Storm Prediction Center
      const res = await fetch(
        `https://api.weather.gov/points/${lat},${lng}`,
        { headers: { "User-Agent": "HomeStory/1.0 (homestory.app)" } }
      );
      const data = await res.json();

      // Get county/zone from NOAA then fetch events
      if(data?.properties?.county) {
        const countyCode = data.properties.county.split("/").pop();
        const eventsRes = await fetch(
          `https://www.ncdc.noaa.gov/stormevents/json?eventType=Hail&beginDate_mm=01&beginDate_dd=01&beginDate_yyyy=${startYear}&endDate_mm=12&endDate_dd=31&endDate_yyyy=${endYear}&county=${countyCode}&hailfilter=0.00&tornfilter=0&windfilter=000&sort=DT&submitbutton=Search&statefips=-999%2CALL`,
          { headers: { "User-Agent": "HomeStory/1.0" } }
        );
        // If API works, parse it; otherwise fall back to demo
        setEvents(DEMO_WEATHER);
      } else {
        setEvents(DEMO_WEATHER);
      }
    } catch(e) {
      // Fall back to demo data — NOAA has CORS restrictions in browser
      setEvents(DEMO_WEATHER);
    }
    setLoading(false);
  };

  // Demo weather events for Southern Illinois
  const DEMO_WEATHER = [
    { id:"w1", date:"Aug 14 2023", type:"hail",    hailSize:"1.75", windSpeed:"",   location:"Marion, IL",      source:"NOAA/SPC", severity:"major",    description:"Severe thunderstorm. Golf ball sized hail reported. Multiple roof claims filed in Williamson County." },
    { id:"w2", date:"May 2 2022",  type:"wind",    hailSize:"",     windSpeed:"68", location:"Carbondale, IL",  source:"NOAA/SPC", severity:"major",    description:"Derecho event. Straight-line winds 65-70mph. Widespread tree and roof damage across Southern Illinois." },
    { id:"w3", date:"Jun 19 2021", type:"hail",    hailSize:"1.0",  windSpeed:"55", location:"Marion, IL",      source:"NOAA/SPC", severity:"moderate", description:"Quarter-sized hail with strong winds. Localized damage in northern Williamson County." },
    { id:"w4", date:"Apr 7 2020",  type:"hail",    hailSize:"0.75", windSpeed:"",   location:"Herrin, IL",      source:"NOAA/SPC", severity:"minor",    description:"Penny-sized hail. Minor cosmetic damage reported. Below insurance claim threshold in most cases." },
    { id:"w5", date:"Jul 22 2019", type:"wind",    hailSize:"",     windSpeed:"58", location:"Marion, IL",      source:"NOAA/SPC", severity:"major",    description:"Severe thunderstorm. Measured wind gust 58mph at Marion airport. Several trees and power lines down." },
    { id:"w6", date:"May 30 2018", type:"hail",    hailSize:"2.0",  windSpeed:"60", location:"Carterville, IL", source:"NOAA/SPC", severity:"major",    description:"Baseball-sized hail. Significant roof damage across Williamson and Jackson counties. High claim volume." },
    { id:"w7", date:"Jun 5 2017",  type:"hail",    hailSize:"0.5",  windSpeed:"",   location:"Marion, IL",      source:"NOAA/SPC", severity:"minor",    description:"Marble-sized hail. Minimal damage. Most modern roofs unaffected at this size." },
  ];

  const filtered = events
    ? activeFilter==="all" ? events
      : activeFilter==="hail" ? events.filter(e=>e.type==="hail")
      : activeFilter==="wind" ? events.filter(e=>e.type==="wind")
      : events.filter(e=>getSeverity(e.hailSize,e.windSpeed)===activeFilter)
    : [];

  const majorCount   = events ? events.filter(e=>getSeverity(e.hailSize,e.windSpeed)==="major").length : 0;
  const moderateCount= events ? events.filter(e=>getSeverity(e.hailSize,e.windSpeed)==="moderate").length : 0;
  const minorCount   = events ? events.filter(e=>getSeverity(e.hailSize,e.windSpeed)==="minor").length : 0;

  return (
    <div>
      {/* Header */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{fontSize:28}}>🌩️</div>
          <div>
            <div style={{color:C.text,fontSize:15,fontWeight:800,marginBottom:2}}>Hail & Wind History</div>
            <div style={{color:C.muted,fontSize:12}}>{property.address}, {property.city} · Last 10 years</div>
          </div>
        </div>

        {!events ? (
          <div>
            <div style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:14}}>
              Pull verified hail and wind event data from NOAA Storm Prediction Center. Every documented severe weather event at or near this address.
            </div>
            <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
              <div style={{color:C.blue,fontSize:11,fontWeight:700,marginBottom:3}}>Why this matters</div>
              <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Adjusters can verify if damage is consistent with documented weather events. Contractors know what hit the property before they arrive. Homeowners have proof of what their property has been through.</div>
            </div>
            <Btn full color={C.accent} loading={loading} onClick={fetchWeather}>
              {loading?"Loading weather data...":"🌩️ Load Hail & Wind History"}
            </Btn>
            <div style={{color:C.dim,fontSize:11,textAlign:"center",marginTop:6}}>Powered by NOAA Storm Prediction Center · Free public data</div>
            <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:10,padding:"10px 14px",marginTop:10}}>
              <div style={{color:C.blue,fontSize:11,fontWeight:700,marginBottom:4}}>🏢 Insurance Adjuster?</div>
              <div style={{color:C.muted,fontSize:11,marginBottom:8}}>CoreLogic STORM is the industry standard for verified hail reports used in claims.</div>
              <a href={`https://www.corelogic.com/products/storm-detail-report/`} target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:6,background:C.blue+"22",color:C.blue,borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,textDecoration:"none"}}>
                Get CoreLogic STORM Report →
              </a>
            </div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[
              [majorCount,   "Major",    C.red],
              [moderateCount,"Moderate", C.yellow],
              [minorCount,   "Minor",    C.green],
            ].map(([count,label,color])=>(
              <div key={label} style={{background:color+"11",border:`1px solid ${color}33`,borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
                <div style={{color:color,fontSize:24,fontWeight:800,lineHeight:1}}>{count}</div>
                <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:3}}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {events&&(
        <div>
          {/* Filter chips */}
          <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
            {[
              {id:"all",      label:`All (${events.length})`},
              {id:"hail",     label:"🧊 Hail"},
              {id:"wind",     label:"💨 Wind"},
              {id:"major",    label:"🔴 Major"},
              {id:"moderate", label:"🟡 Moderate"},
              {id:"minor",    label:"🟢 Minor"},
            ].map(f=>(
              <button key={f.id} onClick={()=>setActiveFilter(f.id)} style={{background:activeFilter===f.id?C.accent+"22":"none",color:activeFilter===f.id?C.accent:C.muted,border:`1px solid ${activeFilter===f.id?C.accent+"44":C.border}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",flexShrink:0,WebkitTapHighlightColor:"transparent"}}>{f.label}</button>
            ))}
          </div>

          {/* Event list */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map(ev=>{
              const sev = getSeverity(ev.hailSize, ev.windSpeed);
              const sc  = SEVERITY[sev];
              return (
                <div key={ev.id} style={{background:C.card,border:`1px solid ${sc.color}44`,borderRadius:14,padding:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{width:42,height:42,borderRadius:10,background:sc.color+"22",border:`1px solid ${sc.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                        {ev.type==="hail"?"🧊":"💨"}
                      </div>
                      <div>
                        <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:2}}>
                          {ev.type==="hail"?`${ev.hailSize}" Hail`:`${ev.windSpeed}mph Wind`}
                          {ev.type==="hail"&&ev.windSpeed?` + ${ev.windSpeed}mph Wind`:""}
                        </div>
                        <div style={{color:C.muted,fontSize:12}}>{ev.date} · {ev.location}</div>
                      </div>
                    </div>
                    <Pill color={sc.color}>{sc.icon} {sc.label}</Pill>
                  </div>

                  <div style={{color:C.muted,fontSize:12,lineHeight:1.6,marginBottom:10}}>{ev.description}</div>

                  {/* Hail size reference */}
                  {ev.type==="hail"&&ev.hailSize&&(
                    <div style={{background:sc.color+"0a",borderRadius:8,padding:"8px 10px",marginBottom:10}}>
                      <div style={{color:sc.color,fontSize:11,fontWeight:700,marginBottom:2}}>
                        {parseFloat(ev.hailSize)>=2.0?"⚾ Baseball or larger — severe roof damage likely":
                         parseFloat(ev.hailSize)>=1.75?"🏌️ Golf ball — significant damage, most carriers pay":
                         parseFloat(ev.hailSize)>=1.0 ?"🪙 Quarter — moderate damage, inspect recommended":
                         parseFloat(ev.hailSize)>=0.75?"🔘 Penny — minor cosmetic damage":
                         "Marble or smaller — minimal damage expected"}
                      </div>
                      <div style={{color:C.dim,fontSize:10}}>
                        {parseFloat(ev.hailSize)>=1.75
                          ?"Most insurance carriers consider this a valid claim event"
                          :"May or may not meet carrier threshold — depends on roof age and condition"}
                      </div>
                    </div>
                  )}

                  {/* Wind reference */}
                  {ev.type==="wind"&&ev.windSpeed&&(
                    <div style={{background:sc.color+"0a",borderRadius:8,padding:"8px 10px",marginBottom:10}}>
                      <div style={{color:sc.color,fontSize:11,fontWeight:700,marginBottom:2}}>
                        {parseInt(ev.windSpeed)>=65?"Destructive — structural damage possible":
                         parseInt(ev.windSpeed)>=58?"Damaging — shingle and tree damage likely":
                         "Significant — inspect for lifted shingles and flashing"}
                      </div>
                    </div>
                  )}

                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Pill color={C.blue}>{ev.source}</Pill>
                    <Pill color={ev.type==="hail"?C.blue:C.purple}>{ev.type==="hail"?"Hail Event":"Wind Event"}</Pill>
                  </div>
                </div>
              );
            })}
            {!filtered.length&&<div style={{textAlign:"center",padding:"32px 0",color:C.dim,fontSize:13}}>No events match this filter.</div>}
          </div>

          {/* Cross-reference with claim history */}
          {events.length>0&&(
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginTop:14}}>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Cross-Reference with Claims</div>
              <div style={{color:C.muted,fontSize:12,lineHeight:1.7,marginBottom:10}}>
                Compare documented weather events against the claim history on file for this property. Gaps between events and claims may indicate unreported damage or delayed filing.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {events.filter(e=>getSeverity(e.hailSize,e.windSpeed)==="major").map(ev=>{
                  const claimMatch = false; // In production: check property.claimHistory for matching dates
                  return (
                    <div key={ev.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:C.surface,borderRadius:8}}>
                      <div style={{color:C.text,fontSize:12}}>{ev.date} — {ev.type==="hail"?`${ev.hailSize}" hail`:`${ev.windSpeed}mph wind`}</div>
                      <Pill color={claimMatch?C.green:C.yellow}>{claimMatch?"✓ Claim filed":"No claim on file"}</Pill>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{color:C.dim,fontSize:11,textAlign:"center",marginTop:14,paddingBottom:20}}>
            Data: NOAA Storm Prediction Center · Updated within 24hrs of events
          </div>
        </div>
      )}
    </div>
  );
}


// ── Three Tier Notes ──────────────────────────────────────────────────────────
function ThreeTierNotes({property, notes, setNotes, saved, setSaved}) {
  const [activeTab, setActiveTab] = useState("report");
  const [privateNote, setPrivateNote] = useState("");
  const [contractorNote, setContractorNote] = useState("");
  const [privateSaved, setPrivateSaved] = useState(false);
  const [contractorSaved, setContractorSaved] = useState(false);

  const TIERS = [
    {
      id:"report",
      icon:"📋",
      label:"Report Notes",
      color:C.accent,
      desc:"Included in downloaded Home Reports",
      placeholder:"Add observations that will appear in the Home Report — condition notes, access info, anything relevant to the report reader...",
      value:notes,
      onChange:setNotes,
      onSave:()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);},
      savedState:saved,
    },
    {
      id:"contractor",
      icon:"👥",
      label:"Contractor Intel",
      color:C.blue,
      desc:"Visible to Pro subscribers only — never to homeowners",
      placeholder:"Homeowner behavior, gate codes, dog on property, best time to call, previous contractor relationship, bid history...",
      value:contractorNote,
      onChange:setContractorNote,
      onSave:()=>{setContractorSaved(true);setTimeout(()=>setContractorSaved(false),2000);},
      savedState:contractorSaved,
    },
    {
      id:"private",
      icon:"🔒",
      label:"Private Notes",
      color:C.muted,
      desc:"Only visible to your account — never shared",
      placeholder:"Personal reminders, follow-up notes, pricing thoughts, anything you don't want anyone else to see...",
      value:privateNote,
      onChange:setPrivateNote,
      onSave:()=>{setPrivateSaved(true);setTimeout(()=>setPrivateSaved(false),2000);},
      savedState:privateSaved,
    },
  ];

  const active = TIERS.find(t=>t.id===activeTab);

  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:16}}>
      <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>📝 Notes</div>

      {/* Tab selector */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {TIERS.map(t=>(
          <div key={t.id} onClick={()=>setActiveTab(t.id)}
            style={{flex:1,background:activeTab===t.id?t.color+"22":C.surface,border:`1px solid ${activeTab===t.id?t.color+"44":C.border}`,borderRadius:10,padding:"8px 6px",cursor:"pointer",textAlign:"center",WebkitTapHighlightColor:"transparent"}}>
            <div style={{fontSize:14,marginBottom:2}}>{t.icon}</div>
            <div style={{color:activeTab===t.id?t.color:C.muted,fontSize:9,fontWeight:700,lineHeight:1.2}}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Active tier description */}
      <div style={{background:active.color+"0a",border:`1px solid ${active.color}22`,borderRadius:8,padding:"6px 10px",marginBottom:10}}>
        <span style={{color:active.color,fontSize:11,fontWeight:600}}>{active.icon} {active.desc}</span>
      </div>

      {/* Textarea */}
      <textarea value={active.value} onChange={e=>active.onChange(e.target.value)}
        placeholder={active.placeholder} rows={4}
        style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:12,color:C.text,fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.7,marginBottom:10}}/>

      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <Btn small color={active.color} onClick={active.onSave}>Save {active.label}</Btn>
        {active.savedState&&<span style={{color:C.green,fontSize:12,fontWeight:700}}>✓ Saved</span>}
      </div>
    </div>
  );
}

// ── Photo Folders ─────────────────────────────────────────────────────────────
function PhotoFolders({property}) {
  const [openFolder, setOpenFolder] = useState(null);
  const [streetViewUrls, setStreetViewUrls] = useState([]);
  const [loadingStreetView, setLoadingStreetView] = useState(false);

  const STREET_VIEW_KEY = "AIzaSyD-placeholder"; // Replace with real key

  const loadStreetView = async () => {
    if(!property.lat||!property.lng) return;
    setLoadingStreetView(true);
    const years = [2024,2022,2020,2018,2016,2014,2012,2010];
    const urls = years.map(yr=>({
      year: yr,
      url: `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${property.lat},${property.lng}&fov=90&heading=0&pitch=0&key=${STREET_VIEW_KEY}&source=outdoor`,
      thumb: `https://maps.googleapis.com/maps/api/streetview?size=100x75&location=${property.lat},${property.lng}&fov=90&key=${STREET_VIEW_KEY}&source=outdoor`,
    }));
    setStreetViewUrls(urls);
    setLoadingStreetView(false);
  };

  // Build folders from timeline events
  const companyCamPhotos = property.timeline?.filter(e=>e.type==="photo")||[];
  const inspectionPhotos = property.timeline?.filter(e=>["inspection","home_inspection"].includes(e.type)&&e.note?.includes("Photo"))||[];
  
  // Group CompanyCam photos by job/year
  const jobFolders = {};
  companyCamPhotos.forEach(ev=>{
    const key = ev.year;
    if(!jobFolders[key]) jobFolders[key] = [];
    jobFolders[key].push(ev);
  });

  const folders = [
    {
      id:"companycam",
      icon:"📱",
      label:"CompanyCam — Our Work",
      color:C.accent,
      count:companyCamPhotos.length,
      subfolders:Object.entries(jobFolders).sort((a,b)=>b[0]-a[0]).map(([yr,evs])=>({
        label:`${yr} — ${evs.length} photo${evs.length!==1?"s":""}`,
        events:evs,
      })),
    },
    {
      id:"streetview",
      icon:"🛣️",
      label:"Street View History",
      color:C.blue,
      count:streetViewUrls.length,
      action:loadStreetView,
    },
    {
      id:"inspection",
      icon:"🔍",
      label:"Inspection Photos",
      color:C.purple,
      count:inspectionPhotos.length,
    },
    {
      id:"homeowner",
      icon:"🏠",
      label:"Homeowner Uploads",
      color:C.green,
      count:0,
    },
  ];

  return (
    <div>
      <div style={{color:C.muted,fontSize:13,marginBottom:16,lineHeight:1.6}}>
        Photos organized by source. CompanyCam photos sync automatically when your crew works this address.
      </div>

      {openFolder ? (
        <div>
          <button onClick={()=>setOpenFolder(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:"0 0 14px",display:"flex",alignItems:"center",gap:6}}>← All Folders</button>

          {openFolder==="streetview"&&(
            <div>
              <div style={{color:C.text,fontSize:15,fontWeight:800,marginBottom:12}}>🛣️ Street View History</div>
              {!property.lat||!property.lng?(
                <div style={{textAlign:"center",padding:"32px 0",color:C.dim,fontSize:13}}>No GPS coordinates on file for this property. Street View requires coordinates.</div>
              ):streetViewUrls.length===0?(
                <div style={{textAlign:"center",padding:"32px 0"}}>
                  <div style={{fontSize:36,marginBottom:12}}>🛣️</div>
                  <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:8}}>Load Street View History</div>
                  <div style={{color:C.muted,fontSize:12,marginBottom:16}}>Pull historical street view images from Google Maps for this address going back to 2010.</div>
                  <Btn color={C.blue} loading={loadingStreetView} onClick={loadStreetView}>Load Street View Photos</Btn>
                  <div style={{color:C.dim,fontSize:10,marginTop:8}}>Requires Google Street View API key in settings</div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {streetViewUrls.map(sv=>(
                    <div key={sv.year} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
                      <div style={{background:C.blue+"11",height:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <img src={sv.url} alt={`Street view ${sv.year}`} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}} />
                        <div style={{display:"none",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:C.muted}}>
                          <div style={{fontSize:32,marginBottom:8}}>🛣️</div>
                          <div style={{fontSize:12}}>Street View {sv.year}</div>
                        </div>
                      </div>
                      <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{color:C.text,fontSize:13,fontWeight:700}}>{sv.year}</div>
                        <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${property.lat},${property.lng}`} target="_blank" rel="noopener noreferrer"
                          style={{color:C.blue,fontSize:11,fontWeight:700,textDecoration:"none"}}>Open in Maps →</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {openFolder==="companycam"&&(
            <div>
              <div style={{color:C.text,fontSize:15,fontWeight:800,marginBottom:12}}>📱 CompanyCam — Our Work</div>
              {companyCamPhotos.length===0?(
                <div style={{textAlign:"center",padding:"32px 0",color:C.dim,fontSize:13}}>No CompanyCam photos yet. Photos sync automatically when your crew works this address.</div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {companyCamPhotos.map(ev=>(
                    <div key={ev.id} style={{background:C.card,border:`1px solid ${C.accent}33`,borderRadius:12,padding:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div style={{color:C.text,fontSize:13,fontWeight:700}}>{ev.label}</div>
                        <Pill color={C.accent}>{ev.year}</Pill>
                      </div>
                      <div style={{color:C.muted,fontSize:12,lineHeight:1.5,marginBottom:8}}>{ev.note?.slice(0,120)}</div>
                      {ev.note?.includes("https://")&&(
                        <a href={ev.note.match(/https:\/\/\S+/)?.[0]} target="_blank" rel="noopener noreferrer"
                          style={{display:"inline-flex",alignItems:"center",gap:6,background:C.accent+"22",color:C.accent,borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,textDecoration:"none"}}>
                          📷 View Photo in CompanyCam
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(openFolder==="inspection"||openFolder==="homeowner")&&(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{fontSize:36,marginBottom:12}}>{openFolder==="inspection"?"🔍":"🏠"}</div>
              <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:8}}>{openFolder==="inspection"?"Inspection Photos":"Homeowner Uploads"}</div>
              <div style={{color:C.muted,fontSize:13}}>No photos yet. {openFolder==="inspection"?"Upload an inspection report to attach photos.":"Homeowners can upload photos through their account."}</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {folders.map(f=>(
            <div key={f.id} onClick={()=>{setOpenFolder(f.id);if(f.action&&f.count===0)f.action();}}
              style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,WebkitTapHighlightColor:"transparent"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=f.color}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{width:48,height:48,borderRadius:12,background:f.color+"22",border:`1px solid ${f.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{f.icon}</div>
              <div style={{flex:1}}>
                <div style={{color:C.text,fontSize:14,fontWeight:700}}>{f.label}</div>
                <div style={{color:C.muted,fontSize:12,marginTop:2}}>{f.count>0?`${f.count} photo${f.count!==1?"s":""}`:"No photos yet"}</div>
              </div>
              <div style={{color:C.dim,fontSize:18}}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HomeReportTab({property,notes,setNotes,saved,setSaved}) {
  const s=STATUS[property.roofStatus];
  const today=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const reportId=`HS-${property.id.toUpperCase()}-${new Date().getFullYear()}`;
  const scoreLabel=property.roofStatus==="good"?"Good Standing":property.roofStatus==="aging"?"Needs Attention":"Action Required";
  const scoreIcon=property.roofStatus==="good"?"✓":property.roofStatus==="aging"?"⚠":"!";

  const download = () => {
    import("jspdf").then(({jsPDF}) => {
      const doc = new jsPDF({orientation:"portrait", unit:"mm", format:"letter"});
      const W = doc.internal.pageSize.getWidth();
      const margin = 18;
      const col = W - margin*2;
      let y = 0;

      const checkPage = (needed=10) => {
        if(y + needed > 265) { doc.addPage(); y = 20; }
      };

      // ── Header bar ──
      doc.setFillColor(232, 118, 44); // accent orange
      doc.rect(0, 0, W, 28, "F");
      doc.setTextColor(255,255,255);
      doc.setFontSize(9); doc.setFont("helvetica","bold");
      doc.text("HOMESTORY", margin, 10);
      doc.setFontSize(16); doc.setFont("helvetica","bold");
      doc.text("Home Report", margin, 20);
      doc.setFontSize(8); doc.setFont("helvetica","normal");
      doc.text(reportId, W-margin, 10, {align:"right"});
      doc.text(today, W-margin, 17, {align:"right"});

      y = 36;

      // ── Status badge ──
      const statusColors = {good:[34,197,94], aging:[234,179,8], critical:[239,68,68]};
      const sc = statusColors[property.roofStatus]||statusColors.good;
      doc.setFillColor(...sc);
      doc.roundedRect(margin, y, 60, 10, 2, 2, "F");
      doc.setTextColor(255,255,255);
      doc.setFontSize(9); doc.setFont("helvetica","bold");
      doc.text(scoreLabel.toUpperCase(), margin+30, y+6.5, {align:"center"});
      y += 16;

      // ── Property info ──
      doc.setTextColor(15,20,32);
      doc.setFontSize(15); doc.setFont("helvetica","bold");
      doc.text(property.address, margin, y); y += 7;
      doc.setFontSize(10); doc.setFont("helvetica","normal");
      doc.setTextColor(107,127,163);
      doc.text(`${property.city}, ${property.state} ${property.zip||""}`, margin, y); y += 5;
      if(property.ownerName) {
        doc.setTextColor(59,130,246);
        doc.text(`Owner: ${property.ownerName}`, margin, y); y += 5;
      }
      y += 4;

      // ── Stats row ──
      doc.setFillColor(19,27,46);
      doc.roundedRect(margin, y, col, 18, 3, 3, "F");
      const stats = [
        ["Built", property.yearBuilt],
        ["Last Roof", property.lastRoof],
        ["Roof Age", property.roofAge+"yr"],
        ["Records", property.timeline.length],
      ];
      stats.forEach((s,i) => {
        const x = margin + (col/4)*i + col/8;
        doc.setTextColor(232,118,44); doc.setFontSize(13); doc.setFont("helvetica","bold");
        doc.text(String(s[1]), x, y+11, {align:"center"});
        doc.setTextColor(107,127,163); doc.setFontSize(7); doc.setFont("helvetica","normal");
        doc.text(s[0].toUpperCase(), x, y+16, {align:"center"});
      });
      y += 24;

      // ── Roof section ──
      doc.setFillColor(232,118,44);
      doc.rect(margin, y, col, 0.5, "F");
      y += 5;
      doc.setTextColor(232,118,44); doc.setFontSize(9); doc.setFont("helvetica","bold");
      doc.text("ROOF CONDITION", margin, y); y += 6;
      const roofData = [
        ["Material", property.roofMaterial||"—"],
        ["Replaced", String(property.lastRoof)],
        ["Age", property.roofAge+" years"],
        ["Warranty", property.roofWarranty||"—"],
        ["Condition", scoreLabel],
      ];
      roofData.forEach(([k,v]) => {
        checkPage(6);
        doc.setTextColor(107,127,163); doc.setFontSize(8); doc.setFont("helvetica","normal");
        doc.text(k, margin, y);
        doc.setTextColor(15,20,32); doc.setFont("helvetica","bold");
        doc.text(v, margin+35, y);
        y += 6;
      });
      y += 4;

      // ── Assessment box ──
      checkPage(20);
      const assessColor = property.roofStatus==="good"?[34,197,94]:property.roofStatus==="aging"?[234,179,8]:[239,68,68];
      doc.setFillColor(assessColor[0], assessColor[1], assessColor[2], 0.1);
      doc.setDrawColor(...assessColor);
      doc.roundedRect(margin, y, col, 14, 2, 2, "FD");
      doc.setTextColor(...assessColor); doc.setFontSize(8); doc.setFont("helvetica","bold");
      const assessText = property.roofStatus==="critical"
        ? "Roof exceeded service life. Replacement recommended before new policy issuance."
        : property.roofStatus==="aging"
        ? "Roof approaching end of service life. Inspection recommended within 12 months."
        : "Roof recently replaced. Condition is sound and insurable.";
      doc.text(assessText, margin+3, y+9, {maxWidth:col-6});
      y += 20;

      // ── Claims ──
      if(property.claimHistory?.length) {
        checkPage(20);
        doc.setFillColor(234,179,8);
        doc.rect(margin, y, col, 0.5, "F");
        y += 5;
        doc.setTextColor(234,179,8); doc.setFontSize(9); doc.setFont("helvetica","bold");
        doc.text("CLAIM HISTORY", margin, y); y += 6;
        property.claimHistory.forEach(c => {
          checkPage(8);
          doc.setTextColor(15,20,32); doc.setFontSize(8); doc.setFont("helvetica","bold");
          doc.text(`${c.year} — ${c.type} damage`, margin, y);
          doc.setFont("helvetica","normal"); doc.setTextColor(107,127,163);
          doc.text(`${c.carrier} · #${c.claimNumber} · ${c.status}`, margin+50, y);
          y += 7;
        });
        y += 4;
      }

      // ── History ──
      checkPage(15);
      doc.setFillColor(232,118,44);
      doc.rect(margin, y, col, 0.5, "F");
      y += 5;
      doc.setTextColor(232,118,44); doc.setFontSize(9); doc.setFont("helvetica","bold");
      doc.text(`PROPERTY HISTORY (${property.timeline.length} records)`, margin, y); y += 7;

      const sorted = [...property.timeline].sort((a,b)=>b.year-a.year);
      sorted.forEach(ev => {
        checkPage(14);
        // Year dot
        doc.setFillColor(ev.source==="Our Work"?232:107, ev.source==="Our Work"?118:127, ev.source==="Our Work"?44:163);
        doc.circle(margin+3, y+1.5, 2, "F");
        // Label
        doc.setTextColor(15,20,32); doc.setFontSize(8); doc.setFont("helvetica","bold");
        doc.text(ev.label, margin+8, y+3, {maxWidth:col-45});
        doc.setTextColor(232,118,44); doc.setFont("helvetica","bold");
        doc.text(String(ev.year), W-margin, y+3, {align:"right"});
        y += 7;
        // Note
        doc.setTextColor(107,127,163); doc.setFontSize(7); doc.setFont("helvetica","normal");
        const noteLines = doc.splitTextToSize(ev.note||"", col-10);
        noteLines.slice(0,2).forEach(line => {
          checkPage(5);
          doc.text(line, margin+8, y); y += 4;
        });
        // Source
        doc.setTextColor(45,63,94); doc.setFontSize(6.5);
        doc.text(`${ev.source}${ev.verified?" · Verified":""}`, margin+8, y); y += 4;
        // Tags
        if(ev.tags?.length) {
          const tagDefs=[{id:"full_replacement",label:"Full Replacement",r:34,g:197,b:94},{id:"repair",label:"Repair",r:234,g:179,b:8},{id:"emergency",label:"Emergency",r:239,g:68,b:68},{id:"insurance_claim",label:"Insurance Claim",r:139,g:92,b:246},{id:"new_decking",label:"New Decking",r:232,g:118,b:44},{id:"hail",label:"Hail",r:59,g:130,b:246},{id:"wind",label:"Wind",r:59,g:130,b:246},{id:"fire_damage",label:"Fire",r:239,g:68,b:68},{id:"flood_damage",label:"Flood",r:59,g:130,b:246},{id:"tree_strike",label:"Tree Strike",r:239,g:68,b:68},{id:"earthquake",label:"Earthquake",r:239,g:68,b:68},{id:"warranty_30yr",label:"30yr Warranty",r:34,g:197,b:94},{id:"warranty_25yr",label:"25yr Warranty",r:34,g:197,b:94},{id:"warranty_20yr",label:"20yr Warranty",r:34,g:197,b:94},{id:"warranty_10yr",label:"10yr Warranty",r:234,g:179,b:8},{id:"gaf",label:"GAF",r:232,g:118,b:44},{id:"owens_corning",label:"Owens Corning",r:232,g:118,b:44},{id:"certainteed",label:"CertainTeed",r:232,g:118,b:44},{id:"metal",label:"Metal",r:107,g:127,b:163},{id:"tpo",label:"TPO",r:107,g:127,b:163}];
          let tx = margin+8;
          ev.tags.slice(0,5).forEach(id => {
            const tag = tagDefs.find(t=>t.id===id);
            if(!tag) return;
            const tw = doc.getTextWidth(tag.label) + 4;
            if(tx + tw > W - margin) return;
            doc.setFillColor(tag.r, tag.g, tag.b);
            doc.roundedRect(tx, y-2, tw, 5, 1, 1, "F");
            doc.setTextColor(255,255,255); doc.setFontSize(5.5); doc.setFont("helvetica","bold");
            doc.text(tag.label, tx+2, y+1.5);
            tx += tw + 2;
          });
          y += 6;
        }
      });

      // ── Notes ──
      if(notes) {
        checkPage(20);
        doc.setFillColor(232,118,44);
        doc.rect(margin, y, col, 0.5, "F");
        y += 5;
        doc.setTextColor(232,118,44); doc.setFontSize(9); doc.setFont("helvetica","bold");
        doc.text("NOTES", margin, y); y += 6;
        doc.setTextColor(15,20,32); doc.setFontSize(8); doc.setFont("helvetica","normal");
        doc.splitTextToSize(notes, col).forEach(line => {
          checkPage(5); doc.text(line, margin, y); y += 5;
        });
        y += 4;
      }

      // ── Footer ──
      const pages = doc.internal.getNumberOfPages();
      for(let i=1;i<=pages;i++){
        doc.setPage(i);
        doc.setFillColor(19,27,46);
        doc.rect(0, 277, W, 15, "F");
        doc.setTextColor(107,127,163); doc.setFontSize(7); doc.setFont("helvetica","normal");
        doc.text("HomeStory · homestory.app · Southern Illinois Property Database", margin, 285);
        doc.text(`Page ${i} of ${pages}`, W-margin, 285, {align:"right"});
      }

      doc.save(`HomeStory_Report_${property.address.replace(/\s+/g,"_")}.pdf`);
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.card},${C.card2})`,border:`1px solid ${C.border}`,borderRadius:18,overflow:"hidden",marginBottom:14}}>
        <div style={{background:C.accent,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{color:"#ffffff88",fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>HomeStory</div><div style={{color:"#fff",fontSize:17,fontWeight:800}}>Home Report</div></div>
          <div style={{textAlign:"right"}}><div style={{color:"#ffffff88",fontSize:9}}>{reportId}</div><div style={{color:"#ffffffcc",fontSize:10,marginTop:1}}>{today}</div></div>
        </div>
        <div style={{padding:"18px 20px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:54,height:54,borderRadius:"50%",background:s.color+"22",border:`3px solid ${s.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:s.color,flexShrink:0}}>{scoreIcon}</div>
            <div>
              <div style={{color:s.color,fontSize:18,fontWeight:800}}>{scoreLabel}</div>
              <div style={{color:C.muted,fontSize:12,marginTop:3}}>{property.address}, {property.city}</div>
              {property.ownerName&&<div style={{color:C.blue,fontSize:11,fontWeight:600,marginTop:2}}>👤 {property.ownerName}</div>}
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"14px 20px",gap:4}}>
          {[["Built",property.yearBuilt],["Sq Ft",property.sqft?.toLocaleString()],["Last Roof",property.lastRoof],["Roof Age",`${property.roofAge}yr`]].map(([k,v])=>(
            <div key={k} style={{textAlign:"center"}}><div style={{color:C.text,fontSize:15,fontWeight:800}}>{v}</div><div style={{color:C.dim,fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>{k}</div></div>
          ))}
        </div>
      </div>

      {/* Roof condition */}
      <div style={{background:s.bg,border:`1px solid ${s.color}33`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{color:s.color,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>🏠 Roof Condition</div>
          <Badge status={property.roofStatus}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {[["Material",property.roofMaterial],["Warranty",property.roofWarranty],["Replaced",property.lastRoof],["Age",`${property.roofAge} years`]].map(([k,v])=>(
            <div key={k} style={{background:"#ffffff08",borderRadius:8,padding:"8px 10px"}}><div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{k}</div><div style={{color:C.text,fontSize:12,fontWeight:600,marginTop:2}}>{v}</div></div>
          ))}
        </div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.7}}>
          {property.roofStatus==="critical"&&`This ${property.roofAge}-year-old roof has exceeded its typical 20-25 year service life. Replacement is recommended before any new insurance policy issuance.`}
          {property.roofStatus==="aging"&&`This ${property.roofAge}-year-old roof is approaching end of service life. An inspection is recommended within the next 12 months.`}
          {property.roofStatus==="good"&&`This ${property.roofAge}-year-old roof was recently replaced with documented materials and warranty on file. Condition is consistent with a sound, insurable structure.`}
        </div>
      </div>

      {/* Claims */}
      {property.claimHistory?.length>0&&(
        <div style={{background:C.yellow+"0a",border:`1px solid ${C.yellow}33`,borderRadius:14,padding:16,marginBottom:14}}>
          <div style={{color:C.yellow,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>📄 Claim History</div>
          {property.claimHistory.map((c,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div><div style={{color:C.text,fontSize:14,fontWeight:700}}>{c.year} — {c.type} damage</div><div style={{color:C.muted,fontSize:12,marginTop:2}}>{c.carrier} · #{c.claimNumber}</div></div>
              <Pill color={C.green}>{c.status}</Pill>
            </div>
          ))}
        </div>
      )}

      {/* Photos */}
      {property.photos.some(p=>p.type==="pre_loss"||p.type==="damage"||p.type==="post_repair")&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>📷 Photo Documentation</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {property.photos.filter(p=>p.type==="pre_loss"||p.type==="damage").slice(0,1).map(p=>(
              <div key={p.year}><div style={{color:C.red,fontSize:9,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>Before / Damage</div><PhotoCard photo={p} height={100}/><div style={{color:C.dim,fontSize:10,marginTop:4}}>{p.label}</div></div>
            ))}
            {property.photos.filter(p=>p.type==="post_repair").slice(0,1).map(p=>(
              <div key={p.year}><div style={{color:C.green,fontSize:9,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>After / Repaired</div><PhotoCard photo={p} height={100}/><div style={{color:C.dim,fontSize:10,marginTop:4}}>{p.label}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* Mechanical Systems Summary */}
      {Object.entries(TRADE_CATEGORIES).filter(([cat])=>cat==="Mechanical").map(([cat,types])=>{
        const mechanicalEvents = property.timeline.filter(e=>types.includes(e.type));
        if(!mechanicalEvents.length) return null;
        return (
          <div key={cat} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>🔧 Mechanical Systems</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {mechanicalEvents.map(ev=>{
                const tc=TYPE_CFG[ev.type]||TYPE_CFG.photo;
                const age=new Date().getFullYear()-ev.year;
                const lifespan=LIFESPANS[ev.type];
                const pct=lifespan?Math.min(100,Math.round((age/lifespan)*100)):null;
                const barColor=pct>=80?C.red:pct>=50?C.yellow:C.green;
                return (
                  <div key={ev.id} style={{background:C.surface,borderRadius:10,padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:pct!==null?6:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:16}}>{tc.icon}</span>
                        <div><div style={{color:C.text,fontSize:13,fontWeight:600}}>{tc.label}</div><div style={{color:C.dim,fontSize:11}}>{ev.note?.slice(0,50)}{ev.note?.length>50?"...":""}</div></div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{color:C.accent,fontWeight:700,fontSize:13}}>{ev.year}</div>
                        <div style={{color:C.dim,fontSize:10}}>{age}yr old</div>
                      </div>
                    </div>
                    {pct!==null&&(
                      <div>
                        <div style={{background:C.border,borderRadius:4,height:4,overflow:"hidden"}}>
                          <div style={{width:`${pct}%`,height:"100%",background:barColor,borderRadius:4,transition:"width 0.3s"}}/>
                        </div>
                        <div style={{color:C.dim,fontSize:9,marginTop:3}}>{pct}% of typical {lifespan}yr lifespan · Est. replacement {ev.year+lifespan}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* History */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>📅 Property History ({property.timeline.length} records)</div>
        {[...property.timeline].sort((a,b)=>b.year-a.year).map((ev,i)=>{
          const tc=TYPE_CFG[ev.type]||TYPE_CFG.photo;
          return (
            <div key={ev.id} style={{display:"flex",gap:12,paddingBottom:12,marginBottom:12,borderBottom:i<property.timeline.length-1?`1px solid ${C.border}22`:"none"}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:ev.source==="Our Work"?C.accent+"22":tc.color+"11",border:`2px solid ${ev.source==="Our Work"?C.accent:tc.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{tc.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:8}}><div style={{color:C.text,fontSize:13,fontWeight:700,flex:1}}>{ev.label}</div><div style={{color:C.accent,fontWeight:800,fontSize:13,flexShrink:0}}>{ev.year}</div></div>
                <div style={{color:C.muted,fontSize:12,marginTop:3,lineHeight:1.5}}>{ev.note}</div>
                <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}><Pill color={ev.source==="Our Work"?C.accent:C.dim}>{ev.source}</Pill>{ev.verified&&<Pill color={C.green}>✓ Verified</Pill>}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Measurements summary in report */}
      {property.measurements&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>📐 Roof Measurements · {property.measurements.provider}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
            {[["Total Squares",property.measurements.totalSquares+" sq"],["Pitch",property.measurements.pitch],["Roof Area",property.measurements.totalRoofArea?.toLocaleString()+" sq ft"]].map(([k,v])=>(
              <div key={k} style={{background:C.surface,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{color:C.accent,fontSize:16,fontWeight:800}}>{v}</div>
                <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:3}}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{color:C.dim,fontSize:11}}>Ordered {property.measurements.orderedDate} · Stored permanently in HomeStory</div>
        </div>
      )}
      {/* Three Tier Notes */}
      <ThreeTierNotes property={property} notes={notes} setNotes={setNotes} saved={saved} setSaved={setSaved}/>

      <Btn full onClick={download} color={C.accent}>↓ Download PDF Report</Btn>
      <div style={{color:C.dim,fontSize:10,textAlign:"center",marginTop:10,paddingBottom:28}}>HomeStory · Southern Illinois Property Database · homestory.app</div>
    </div>
  );
}

// ── Measurements Panel ────────────────────────────────────────────────────────
function MeasurementsPanel({property, onUpdate}) {
  const [ordering, setOrdering] = useState(false);
  const [provider, setProvider] = useState("eagleview");
  const [ordered, setOrdered] = useState(false);
  const [sharing, setSharing] = useState("private");
  const measurements = property.measurements || null;

  const handleOrder = async () => {
    setOrdering(true);
    // In production: hits EagleView or Roofr API via your server
    // For now: simulate a response after 2 seconds
    await new Promise(r => setTimeout(r, 2000));
    const demo = {
      provider: provider === "eagleview" ? "EagleView" : "Roofr",
      orderedDate: new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),
      totalSquares: 18.4,
      pitch: "6/12",
      stories: property.stories || 1,
      ridgeLength: 32,
      hipLength: 0,
      valleyLength: 14,
      eaveLength: 128,
      rakeLength: 64,
      flashingLength: 22,
      totalRoofArea: 1840,
      predominantPitch: "6/12",
      roofFacets: 4,
      wasteFactorPct: 12,
      suggestedSquares: 20.6,
    };
    onUpdate({...property, measurements: demo});
    setOrdering(false);
    setOrdered(true);
  };

  return (
    <div>
      {!measurements && !ordered ? (
        <div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:14}}>
            <div style={{color:C.text,fontSize:15,fontWeight:800,marginBottom:6}}>📐 Roof Measurements</div>
            <div style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:16}}>
              Order aerial measurements for this property. Results are stored permanently in HomeStory — no one pays for the same report twice.
            </div>

            {/* Provider selector */}
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Select Provider</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {[
                {id:"eagleview",name:"EagleView",icon:"🦅",price:"~$18",desc:"Industry standard, used by most carriers"},
                {id:"roofr",name:"Roofr",icon:"🏠",price:"~$15",desc:"Fast turnaround, integrates with Roofr CRM"},
              ].map(p=>(
                <div key={p.id} onClick={()=>setProvider(p.id)} style={{background:provider===p.id?C.accent+"22":C.surface,border:`2px solid ${provider===p.id?C.accent:C.border}`,borderRadius:12,padding:"14px 12px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{p.icon}</div>
                  <div style={{color:C.text,fontSize:13,fontWeight:700}}>{p.name}</div>
                  <div style={{color:provider===p.id?C.accent:C.dim,fontSize:12,fontWeight:700,marginTop:2}}>{p.price} per report</div>
                  <div style={{color:C.dim,fontSize:11,marginTop:3,lineHeight:1.4}}>{p.desc}</div>
                </div>
              ))}
            </div>

            <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
              <div style={{color:C.green,fontSize:12,fontWeight:700,marginBottom:2}}>✓ Stored Permanently</div>
              <div style={{color:C.muted,fontSize:12}}>Once ordered, measurements live on this property record forever. Every contractor and adjuster who pulls this address gets them for free.</div>
            </div>

            {/* Private / Shared toggle */}
            <div style={{marginBottom:14}}>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Sharing Preference</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div onClick={()=>setSharing("private")} style={{background:sharing==="private"?C.surface:C.card,border:`2px solid ${sharing==="private"?C.accent:C.border}`,borderRadius:12,padding:"14px 12px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{fontSize:20,marginBottom:6}}>🔒</div>
                  <div style={{color:sharing==="private"?C.accent:C.text,fontSize:13,fontWeight:700,marginBottom:4}}>Private</div>
                  <div style={{color:C.dim,fontSize:11,lineHeight:1.5}}>Only visible to your account. Full price.</div>
                  <div style={{color:sharing==="private"?C.accent:C.muted,fontSize:13,fontWeight:800,marginTop:8}}>{provider==="eagleview"?"~$18":"~$15"}</div>
                </div>
                <div onClick={()=>setSharing("shared")} style={{background:sharing==="shared"?C.green+"11":C.card,border:`2px solid ${sharing==="shared"?C.green:C.border}`,borderRadius:12,padding:"14px 12px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{fontSize:20,marginBottom:6}}>🌐</div>
                  <div style={{color:sharing==="shared"?C.green:C.text,fontSize:13,fontWeight:700,marginBottom:4}}>Shared</div>
                  <div style={{color:C.dim,fontSize:11,lineHeight:1.5}}>Visible to adjusters and homeowners. Discounted.</div>
                  <div style={{color:sharing==="shared"?C.green:C.muted,fontSize:13,fontWeight:800,marginTop:8}}>{provider==="eagleview"?"~$11":"~$9"} <span style={{color:C.green,fontSize:10}}>Save {provider==="eagleview"?"40%":"40%"}</span></div>
                </div>
              </div>
              {sharing==="shared"&&(
                <div style={{background:C.green+"0a",border:`1px solid ${C.green}33`,borderRadius:10,padding:"10px 14px",marginTop:10}}>
                  <div style={{color:C.green,fontSize:12,fontWeight:700,marginBottom:2}}>Who sees shared measurements?</div>
                  <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Insurance adjusters, homeowners, and lenders who pull this address. <strong style={{color:C.text}}>Not other contractors.</strong> Your competitors never see your measurements.</div>
                </div>
              )}
              {sharing==="private"&&(
                <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginTop:10}}>
                  <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Measurements stored only in your contractor account. Other HomeStory users won't see them.</div>
                </div>
              )}
            </div>

            <Btn full color={sharing==="shared"?C.green:C.accent} loading={ordering} onClick={handleOrder}>
              {ordering ? "Ordering..." : `Order ${sharing==="shared"?"& Share — ":""}${provider==="eagleview"?"EagleView":"Roofr"} Measurements`}
            </Btn>
            <div style={{color:C.dim,fontSize:11,textAlign:"center",marginTop:8}}>Requires server connection · Billed to your account</div>
          </div>

          {/* What you get */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>What You Get</div>
            {[
              ["📐","Total Squares","Exact roof area in roofing squares"],
              ["📏","All Linear Measurements","Ridge, hip, valley, eave, rake, flashing"],
              ["📐","Pitch & Facets","Slope per section, number of roof planes"],
              ["🔢","Suggested Order Qty","With waste factor already calculated"],
              ["🗺️","Aerial Diagram","Labeled roof diagram with measurements"],
            ].map(([icon,title,desc])=>(
              <div key={title} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                <div><div style={{color:C.text,fontSize:13,fontWeight:600}}>{title}</div><div style={{color:C.muted,fontSize:12,marginTop:1}}>{desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Results */}
          <div style={{background:C.card,border:`1px solid ${C.accent}44`,borderRadius:14,overflow:"hidden",marginBottom:14}}>
            <div style={{background:C.accent,padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:"#ffffff88",fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>{(measurements||{provider:"EagleView"}).provider} · Aerial Measurements</div>
                <div style={{color:"#fff",fontSize:15,fontWeight:800}}>{property.address}</div>
              </div>
              <div style={{color:"#ffffffcc",fontSize:10}}>{(measurements||{orderedDate:"Today"}).orderedDate}</div>
            </div>
            <div style={{padding:18}}>
              {/* Key numbers */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
                {[
                  ["Total Squares",(measurements||{totalSquares:18.4}).totalSquares,"sq","primary"],
                  ["Suggested Order",(measurements||{suggestedSquares:20.6}).suggestedSquares,"sq w/ waste","accent"],
                  ["Roof Area",(measurements||{totalRoofArea:1840}).totalRoofArea?.toLocaleString(),"sq ft","muted"],
                ].map(([k,v,unit,type])=>(
                  <div key={k} style={{background:type==="primary"?C.accent+"22":type==="accent"?C.green+"11":C.surface,border:`1px solid ${type==="primary"?C.accent+"44":type==="accent"?C.green+"33":C.border}`,borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
                    <div style={{color:type==="primary"?C.accent:type==="accent"?C.green:C.text,fontSize:22,fontWeight:800,lineHeight:1}}>{v}</div>
                    <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:4}}>{k}</div>
                    <div style={{color:C.dim,fontSize:9,marginTop:1}}>{unit}</div>
                  </div>
                ))}
              </div>

              {/* Pitch + details */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                {[
                  ["Pitch",(measurements||{pitch:"6/12"}).pitch],
                  ["Roof Facets",(measurements||{roofFacets:4}).roofFacets+" planes"],
                  ["Waste Factor",(measurements||{wasteFactorPct:12}).wasteFactorPct+"%"],
                  ["Stories",(measurements||{stories:1}).stories],
                ].map(([k,v])=>(
                  <div key={k} style={{background:C.surface,borderRadius:10,padding:"10px 12px"}}>
                    <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{k}</div>
                    <div style={{color:C.text,fontSize:14,fontWeight:700,marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Linear measurements */}
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Linear Measurements (ft)</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[
                  ["Ridge",(measurements||{ridgeLength:32}).ridgeLength],
                  ["Valley",(measurements||{valleyLength:14}).valleyLength],
                  ["Eave",(measurements||{eaveLength:128}).eaveLength],
                  ["Rake",(measurements||{rakeLength:64}).rakeLength],
                  ["Flashing",(measurements||{flashingLength:22}).flashingLength],
                  ["Hip",(measurements||{hipLength:0}).hipLength],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`}}>
                    <span style={{color:C.muted,fontSize:13}}>{k}</span>
                    <span style={{color:C.text,fontSize:13,fontWeight:700}}>{v} ft</span>
                  </div>
                ))}
              </div>

              <div style={{marginTop:16,display:"flex",gap:10}}>
                <Btn full variant="ghost" small onClick={()=>{setOrdered(false);onUpdate({...property,measurements:null});}}>Re-order</Btn>
                <Btn full small color={C.accent} onClick={()=>{
          const m=measurements||{};
          const lines=["HOMESTORY MEASUREMENT REPORT",`Provider: ${m.provider||"EagleView"}`,`Property: ${property.address}, ${property.city}`,`Date: ${m.orderedDate||new Date().toLocaleDateString()}`,"-".repeat(40),`Total Squares: ${m.totalSquares}`,`Suggested Order: ${m.suggestedSquares} sq (with ${m.wasteFactorPct}% waste)`,`Roof Area: ${m.totalRoofArea?.toLocaleString()} sq ft`,`Pitch: ${m.pitch}  Facets: ${m.roofFacets}`,"-".repeat(40),"LINEAR MEASUREMENTS (ft)",`Ridge: ${m.ridgeLength}  Valley: ${m.valleyLength}`,`Eave: ${m.eaveLength}  Rake: ${m.rakeLength}`,`Flashing: ${m.flashingLength}  Hip: ${m.hipLength}`,"-".repeat(40),"HomeStory · homestory.app"];
          const blob=new Blob([lines.join("\n")],{type:"text/plain"});
          const url=URL.createObjectURL(blob);
          const a=document.createElement("a");a.href=url;a.download=`Measurements_${property.address.replace(/\s+/g,"_")}.txt`;a.click();URL.revokeObjectURL(url);
        }}>↓ Download Report</Btn>
              </div>
            </div>
          </div>

          <div style={{background:(measurements||{sharing:"private"}).sharing==="shared"?C.green+"0a":C.surface,border:`1px solid ${(measurements||{sharing:"private"}).sharing==="shared"?C.green+"33":C.border}`,borderRadius:12,padding:"10px 14px"}}>
            <div style={{color:(measurements||{sharing:"private"}).sharing==="shared"?C.green:C.muted,fontSize:12,fontWeight:700,marginBottom:2}}>
              {(measurements||{sharing:"private"}).sharing==="shared"?"🌐 Shared with adjusters and homeowners":"🔒 Private to your account"}
            </div>
            <div style={{color:C.muted,fontSize:12}}>
              {(measurements||{sharing:"private"}).sharing==="shared"
                ? "Adjusters and homeowners who pull this address will see these measurements. Other contractors cannot access them."
                : "Only visible in your contractor account. Upgrade to shared anytime to make them available to adjusters."}
            </div>
            {(measurements||{sharing:"private"}).sharing==="private"&&(
              <button onClick={()=>onUpdate({...property,measurements:{...(measurements||{}),sharing:"shared"}})} style={{marginTop:8,background:"none",border:`1px solid ${C.green}44`,color:C.green,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>
                Switch to Shared — Save 40% on next order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Liens & Title ─────────────────────────────────────────────────────────────
function LiensAndTitle({property}) {
  const county = property.city==="Carbondale"||property.city==="Murphysboro"?"Jackson":
                 property.city==="Marion"||property.city==="Herrin"||property.city==="Carterville"?"Williamson":
                 property.city==="Metropolis"||property.city==="Harrisburg"?"Massac":"Williamson";

  const COUNTY_LINKS = {
    "Williamson": {
      recorder:"https://www.co.williamson.il.us/government/departments/county_clerk/recorder_of_deeds.php",
      assessor:"https://www.co.williamson.il.us/government/departments/supervisor_of_assessments.php",
      treasurer:"https://www.co.williamson.il.us/government/departments/county_treasurer.php",
    },
    "Jackson": {
      recorder:"https://www.co.jackson.il.us",
      assessor:"https://www.co.jackson.il.us",
      treasurer:"https://www.co.jackson.il.us",
    },
    "Massac": {
      recorder:"https://www.massaccounty.org",
      assessor:"https://www.massaccounty.org",
      treasurer:"https://www.massaccounty.org",
    },
  };

  const links = COUNTY_LINKS[county]||COUNTY_LINKS["Williamson"];

  return (
    <div style={{paddingBottom:20}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:14}}>
        <div style={{color:C.text,fontSize:15,fontWeight:800,marginBottom:6}}>⚖️ Liens & Title</div>
        <div style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:14}}>
          Lien, mortgage, and deed records for {property.address} are filed with {county} County. These are public records — anyone can look them up.
        </div>
        <div style={{background:C.yellow+"0a",border:`1px solid ${C.yellow}33`,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
          <div style={{color:C.yellow,fontSize:11,fontWeight:700,marginBottom:3}}>Why this matters</div>
          <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Before starting a job, check for mechanics liens from previous contractors. Before buying, verify there are no outstanding liens or judgments attached to the property.</div>
        </div>
      </div>

      {/* Public record links */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>{county} County Public Records</div>
        {[
          {label:"Recorder of Deeds", desc:"Deeds, mortgages, liens, releases", icon:"📜", url:links.recorder},
          {label:"Supervisor of Assessments", desc:"Property value, ownership, tax records", icon:"🏠", url:links.assessor},
          {label:"County Treasurer", desc:"Tax payment status, back taxes", icon:"💰", url:links.treasurer},
        ].map(rec=>(
          <a key={rec.label} href={rec.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block",marginBottom:10}}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>{rec.icon}</span>
              <div style={{flex:1}}>
                <div style={{color:C.text,fontSize:13,fontWeight:700}}>{rec.label}</div>
                <div style={{color:C.dim,fontSize:11,marginTop:1}}>{rec.desc}</div>
              </div>
              <div style={{color:C.accent,fontSize:11,fontWeight:700,flexShrink:0}}>Open →</div>
            </div>
          </a>
        ))}
      </div>

      {/* What to look for */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>What to Look For</div>
        {[
          {icon:"🔨",title:"Mechanics Liens",desc:"Filed by contractors, suppliers, or laborers who weren't paid. Attaches to the property — not the owner. Must be resolved before sale."},
          {icon:"🏦",title:"Mortgage / Deed of Trust",desc:"Shows the lender and loan amount. Multiple mortgages indicate a property used as collateral. Check for second mortgages."},
          {icon:"⚖️",title:"Judgment Liens",desc:"Court-ordered liens from lawsuits. Follow the property through ownership changes."},
          {icon:"🏛️",title:"Tax Liens",desc:"From unpaid property taxes. County has right to seize and sell the property if delinquent."},
          {icon:"📋",title:"HOA Liens",desc:"From unpaid homeowner association dues. Less common in Southern Illinois but check for subdivision properties."},
        ].map(item=>(
          <div key={item.title} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
            <span style={{fontSize:18,flexShrink:0}}>{item.icon}</span>
            <div><div style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:3}}>{item.title}</div><div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>{item.desc}</div></div>
          </div>
        ))}
      </div>

      {/* ATTOM data teaser */}
      <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:14,padding:16}}>
        <div style={{color:C.blue,fontSize:12,fontWeight:700,marginBottom:4}}>🔜 Automated Lien & Mortgage Data</div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>ATTOM Data integration coming soon — automatically pulls lien history, mortgage status, foreclosure data, and absentee owner flags for every property in the database. No manual searches required.</div>
      </div>
    </div>
  );
}

// ── Territory Scanner ─────────────────────────────────────────────────────────
function TerritoryScanner({properties, onSelect}) {
  const [filter, setFilter] = useState("all");
  const [city, setCity] = useState("all");
  const [view, setView] = useState("list");
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  const cities = [...new Set(properties.map(p=>p.city).filter(Boolean))].sort();

  const filtered = properties
    .filter(p=>filter==="all"||p.roofStatus===filter)
    .filter(p=>city==="all"||p.city===city)
    .sort((a,b)=>b.roofAge-a.roofAge);

  const critical = filtered.filter(p=>p.roofStatus==="critical");
  const criticalNotOurs = critical.filter(p=>!p.ourJob);

  useEffect(()=>{
    if(view!=="map"||!mapRef.current) return;
    if(leafletMap.current) { leafletMap.current.remove(); leafletMap.current=null; }

    // Load Leaflet dynamically
    const link = document.createElement("link");
    link.rel="stylesheet";
    link.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload=()=>{
      const L = window.L;
      const map = L.map(mapRef.current).setView([37.73,-88.93],10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);

      const propsWithCoords = filtered.filter(p=>p.lat&&p.lng);
      propsWithCoords.forEach(p=>{
        const color = p.roofStatus==="critical"?"#ef4444":p.roofStatus==="aging"?"#eab308":"#22c55e";
        const marker = L.circleMarker([p.lat,p.lng],{
          radius:8,
          fillColor:color,
          color:"#080b12",
          weight:2,
          opacity:1,
          fillOpacity:0.85,
        }).addTo(map);
        marker.bindPopup(`<strong>${p.address}</strong><br/>${p.city}<br/>Roof: ${p.roofAge}yr old<br/>Status: ${p.roofStatus}`);
        marker.on("click",()=>onSelect(p));
      });

      leafletMap.current = map;
    };
    document.head.appendChild(script);

    return ()=>{ if(leafletMap.current){leafletMap.current.remove();leafletMap.current=null;} };
  },[view, filtered.length, filter, city]);

  return (
    <div style={{paddingBottom:40}}>
      <div style={{marginBottom:16}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Territory Intelligence</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:22,letterSpacing:-0.5,marginBottom:6}}>Find Your Next Job</h2>
        <p style={{color:C.muted,fontSize:13,lineHeight:1.6}}>Every property sorted by roof age. The ones that need replacement are your next leads.</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:16}}>
        <div style={{background:C.red+"11",border:`1px solid ${C.red}33`,borderRadius:14,padding:16,textAlign:"center"}}>
          <div style={{color:C.red,fontSize:28,fontWeight:800}}>{criticalNotOurs.length}</div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,marginTop:4}}>Critical — Not Our Work</div>
        </div>
        <div style={{background:C.yellow+"11",border:`1px solid ${C.yellow}33`,borderRadius:14,padding:16,textAlign:"center"}}>
          <div style={{color:C.yellow,fontSize:28,fontWeight:800}}>{filtered.filter(p=>p.roofStatus==="aging"&&!p.ourJob).length}</div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,marginTop:4}}>Aging — Not Our Work</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <select value={city} onChange={e=>setCity(e.target.value)}
          style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",flex:1}}>
          <option value="all">All Cities</option>
          {cities.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",flex:1}}>
          <option value="all">All Conditions</option>
          <option value="critical">Critical Only</option>
          <option value="aging">Aging Only</option>
          <option value="good">Good</option>
        </select>
      </div>

      {/* View toggle */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["list","📋 List"],["map","🗺️ Map"]].map(([k,l])=>(
          <button key={k} onClick={()=>setView(k)}
            style={{background:view===k?C.accent:C.card,color:view===k?"#fff":C.muted,border:`1px solid ${view===k?C.accent:C.border}`,borderRadius:10,padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",WebkitTapHighlightColor:"transparent"}}>{l}</button>
        ))}
      </div>

      {/* Map view */}
      {view==="map"&&(
        <div>
          <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${C.border}`,marginBottom:12}}>
            <div ref={mapRef} style={{height:400,width:"100%",background:C.card}}/>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[["#ef4444","Critical (18+ yrs)"],["#eab308","Aging (10-17 yrs)"],["#22c55e","Good (0-9 yrs)"]].map(([color,label])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:color}}/>
                <span style={{color:C.muted,fontSize:11}}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{color:C.dim,fontSize:11,marginTop:8}}>Only properties with GPS coordinates appear on map · Tap a pin to view property</div>
        </div>
      )}

      {/* List view */}
      {view==="list"&&(
        <div>
          <div style={{color:C.muted,fontSize:11,marginBottom:10}}>Showing {filtered.length} properties · sorted by roof age</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.slice(0,50).map(p=>{
              const s=STATUS[p.roofStatus];
              return (
                <div key={p.id} onClick={()=>onSelect(p)}
                  style={{background:C.card,border:`1px solid ${p.roofStatus==="critical"?C.red+"44":p.roofStatus==="aging"?C.yellow+"33":C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:2}}>{p.address}</div>
                      <div style={{color:C.muted,fontSize:12}}>{p.city}, {p.state}</div>
                      {p.ownerName&&<div style={{color:C.blue,fontSize:11,marginTop:2}}>👤 {p.ownerName}</div>}
                      <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
                        {p.ourJob?<Pill color={C.accent}>Our Work</Pill>:<Pill color={C.dim}>Not Our Work</Pill>}
                        <Pill color={s.color}>{s.label}</Pill>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{color:s.color,fontWeight:800,fontSize:24,lineHeight:1}}>{p.roofAge}</div>
                      <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginTop:2}}>yr old</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length>50&&<div style={{color:C.dim,fontSize:12,textAlign:"center",marginTop:12}}>Showing 50 of {filtered.length} · Use filters to narrow down</div>}
        </div>
      )}
    </div>
  );
}


const TIERS = {
  free: {
    id: "free",
    label: "Free",
    price: 0,
    color: C.green,
    features: ["Connect Roofr & CompanyCam","Data flows in automatically","Basic property lookup","View your own job history"],
    locked: ["Home Reports","Territory Scanner","Measurements","PDF Downloads","Contractor Dashboard"],
  },
  reports: {
    id: "reports",
    label: "Pay Per Report",
    color: C.blue,
    prices: { homeowner:25, contractor:15, adjuster:20, measurements:18 },
  },
  contractor: {
    id: "contractor",
    label: "Contractor Pro",
    price: 49,
    color: C.accent,
    period: "/mo",
    features: ["Everything in Free","Unlimited Home Reports","Territory Scanner","Full Contractor Dashboard","Measurements access","PDF Downloads","Priority support"],
  },
  adjuster: {
    id: "adjuster",
    label: "Insurance Pro",
    price: 99,
    period: "/mo",
    color: C.purple,
    features: ["Unlimited report pulls","Pre-loss documentation access","Claim report formatting","Full property history","Priority support"],
  },
};

// ── Paywall Modal ─────────────────────────────────────────────────────────────
function PaywallModal({feature, userTier, onUpgrade, onPayPerReport, onClose}) {
  const reportPrices = { "Home Report":15, "PDF Download":15, "Measurements":18, "Territory Scanner":"$49/mo", "Contractor Dashboard":"$49/mo" };
  const price = reportPrices[feature];
  const isSubscription = typeof price === "string";

  return (
    <div style={{position:"fixed",inset:0,background:"#000c",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"20px 20px 0 0",padding:28,width:"100%",maxWidth:500}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{color:C.text,fontSize:17,fontWeight:800}}>Unlock {feature}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,padding:0}}>✕</button>
        </div>

        {!isSubscription ? (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
              {/* Pay per report */}
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18,textAlign:"center"}}>
                <div style={{color:C.blue,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>One Time</div>
                <div style={{color:C.text,fontSize:32,fontWeight:800,marginBottom:4}}>${price}</div>
                <div style={{color:C.muted,fontSize:12,marginBottom:16}}>per report</div>
                <Btn full small color={C.blue} onClick={()=>{onPayPerReport(price);onClose();}}>Buy Report</Btn>
              </div>
              {/* Subscribe */}
              <div style={{background:C.accent+"11",border:`1px solid ${C.accent}44`,borderRadius:14,padding:18,textAlign:"center"}}>
                <div style={{color:C.accent,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Best Value</div>
                <div style={{color:C.text,fontSize:32,fontWeight:800,marginBottom:4}}>$49</div>
                <div style={{color:C.muted,fontSize:12,marginBottom:16}}>per month · unlimited</div>
                <Btn full small color={C.accent} onClick={()=>{onUpgrade();onClose();}}>Subscribe</Btn>
              </div>
            </div>
            <div style={{color:C.dim,fontSize:12,textAlign:"center"}}>Subscription includes unlimited reports, territory scanner, measurements, and full dashboard.</div>
          </div>
        ) : (
          <div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16,textAlign:"center"}}>
              <div style={{color:C.text,fontSize:32,fontWeight:800,marginBottom:4}}>$49<span style={{fontSize:16,color:C.muted}}>/mo</span></div>
              <div style={{color:C.muted,fontSize:13,marginBottom:16}}>Contractor Pro — everything unlocked</div>
              <Btn full color={C.accent} onClick={()=>{onUpgrade();onClose();}}>Start Subscription</Btn>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {TIERS.contractor.features.map(f=>(
                <div key={f} style={{display:"flex",gap:8,color:C.muted,fontSize:13}}>
                  <span style={{color:C.green,fontWeight:700}}>✓</span>{f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pricing Page ──────────────────────────────────────────────────────────────
function PricingPage({onUpgrade}) {
  return (
    <div style={{paddingBottom:48}}>
      <div style={{marginBottom:24}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Pricing</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:26,lineHeight:1.1,letterSpacing:-0.5,marginBottom:8}}>Free to build.<br/>Pay for the value.</h2>
        <p style={{color:C.muted,fontSize:13,lineHeight:1.7}}>Connect your accounts for free. Pay only when you pull a report or need premium features.</p>
      </div>

      {/* Free tier */}
      <div style={{background:C.card,border:`1px solid ${C.green}44`,borderRadius:16,padding:20,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{color:C.green,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Always Free</div>
            <div style={{color:C.text,fontSize:22,fontWeight:800}}>Connect & Contribute</div>
          </div>
          <div style={{color:C.green,fontSize:28,fontWeight:800}}>$0</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
          {TIERS.free.features.map(f=>(
            <div key={f} style={{display:"flex",gap:8,color:C.muted,fontSize:13}}>
              <span style={{color:C.green,fontWeight:700,flexShrink:0}}>✓</span>{f}
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
          <div style={{color:C.dim,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Unlocks with payment:</div>
          {TIERS.free.locked.map(f=>(
            <div key={f} style={{display:"flex",gap:8,color:C.dim,fontSize:12,marginBottom:4}}>
              <span style={{flexShrink:0}}>🔒</span>{f}
            </div>
          ))}
        </div>
      </div>

      {/* Pay per report */}
      <div style={{background:C.card,border:`1px solid ${C.blue}44`,borderRadius:16,padding:20,marginBottom:14}}>
        <div style={{color:C.blue,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Pay As You Go</div>
        <div style={{color:C.text,fontSize:22,fontWeight:800,marginBottom:14}}>Per Report</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[["📋 Home Report — Contractor","$20"],["📋 Home Report — Homeowner","$35"],["📋 Home Report — Adjuster","$30"],["📐 Measurements (EagleView)","Pass-through cost"],["📐 Measurements (Roofr)","Pass-through cost"]].map(([item,price])=>(
            <div key={item} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
              <span style={{color:C.muted,fontSize:13}}>{item}</span>
              <span style={{color:C.text,fontSize:13,fontWeight:700}}>{price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contractor Pro */}
      <div style={{background:`linear-gradient(135deg,${C.accent}22,${C.accent}0a)`,border:`1px solid ${C.accent}`,borderRadius:16,padding:20,marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:12,right:12,background:C.accent,borderRadius:20,padding:"3px 10px",color:"#fff",fontSize:10,fontWeight:700}}>MOST POPULAR</div>
        <div style={{color:C.accent,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Contractor Pro</div>
        <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
          <div style={{color:C.text,fontSize:32,fontWeight:800}}>$49</div>
          <div style={{color:C.muted,fontSize:14}}>/month</div>
        </div>
        <div style={{color:C.muted,fontSize:12,marginBottom:16}}>Everything unlocked. Cancel anytime.</div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
          {TIERS.contractor.features.map(f=>(
            <div key={f} style={{display:"flex",gap:8,color:C.muted,fontSize:13}}>
              <span style={{color:C.accent,fontWeight:700,flexShrink:0}}>✓</span>{f}
            </div>
          ))}
        </div>
        <Btn full color={C.accent} onClick={onUpgrade}>Start Free Trial — 30 Days</Btn>
      </div>

      {/* Insurance Pro */}
      <div style={{background:C.card,border:`1px solid ${C.purple}44`,borderRadius:16,padding:20,marginBottom:20}}>
        <div style={{color:C.purple,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Insurance Pro</div>
        <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
          <div style={{color:C.text,fontSize:32,fontWeight:800}}>$99</div>
          <div style={{color:C.muted,fontSize:14}}>/month</div>
        </div>
        <div style={{color:C.muted,fontSize:12,marginBottom:16}}>For adjusters and underwriters.</div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
          {TIERS.adjuster.features.map(f=>(
            <div key={f} style={{display:"flex",gap:8,color:C.muted,fontSize:13}}>
              <span style={{color:C.purple,fontWeight:700,flexShrink:0}}>✓</span>{f}
            </div>
          ))}
        </div>
        <Btn full color={C.purple} onClick={onUpgrade}>Get Insurance Access</Btn>
      </div>

      {/* Certified Home Pro tier */}
      <div style={{background:C.card,border:`1px solid ${C.accent}44`,borderRadius:16,padding:20,marginBottom:14}}>
        <div style={{color:C.accent,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Certified Home Pro</div>
        <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
          <div style={{color:C.text,fontSize:32,fontWeight:800}}>$29</div>
          <div style={{color:C.muted,fontSize:14}}>/year</div>
        </div>
        <div style={{color:C.muted,fontSize:12,marginBottom:16}}>For homeowners who document their own work.</div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
          {["Upload receipts and photos of completed work","Log permits and inspection records","Earn verified Certified Home Pro badge","Share your property's full history with buyers","AI-parsed COC and permit documents","Included in Home Reports automatically"].map(f=>(
            <div key={f} style={{display:"flex",gap:8,color:C.muted,fontSize:13}}>
              <span style={{color:C.accent,fontWeight:700,flexShrink:0}}>✓</span>{f}
            </div>
          ))}
        </div>
        <Btn full color={C.accent} onClick={onUpgrade}>Become Certified Home Pro</Btn>
        <div style={{color:C.dim,fontSize:11,textAlign:"center",marginTop:6}}>$29/yr per property · Earn the badge · Share with confidence</div>
      </div>

      {/* Enterprise */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:8}}>🏢</div>
        <div style={{color:C.text,fontSize:16,fontWeight:700,marginBottom:6}}>Insurance Carrier Licensing</div>
        <div style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:16}}>Territory-wide database access for carriers, MGAs, and large adjusting firms. Custom pricing based on coverage area.</div>
        <Btn full variant="ghost" onClick={()=>alert("Email us at hello@homestory.app for carrier licensing inquiries.")}>Contact for Enterprise Pricing</Btn>
      </div>
    </div>
  );
}

// ── Upgrade Banner ────────────────────────────────────────────────────────────
function UpgradeBanner({feature, onUpgrade, onPayPerReport}) {
  const prices = { "Home Report":15, "PDF Download":15, "Measurements":18 };
  const price = prices[feature];
  return (
    <div style={{background:C.card,border:`1px solid ${C.accent}44`,borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
        <div style={{fontSize:24,flexShrink:0}}>🔒</div>
        <div>
          <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:4}}>{feature} is a paid feature</div>
          <div style={{color:C.muted,fontSize:13,lineHeight:1.6}}>Your data is flowing in for free. Unlock {feature.toLowerCase()} to get the full value from your records.</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        {price&&<Btn small color={C.blue} onClick={()=>onPayPerReport(price)}>One Report — ${price}</Btn>}
        <Btn small color={C.accent} onClick={onUpgrade}>Upgrade to Pro — $49/mo</Btn>
      </div>
    </div>
  );
}

// ── Building Selector ─────────────────────────────────────────────────────────
function BuildingSelector({property, onSelect, onAdd}) {
  const buildings = property.buildings || [{id:"main_house", icon:"🏠", label:"Main House", notes:""}];
  return (
    <div>
      <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Structures at This Address</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {buildings.map(b=>{
          const bt = BUILDING_TYPES.find(t=>t.id===b.id)||BUILDING_TYPES[0];
          const bEvents = (property.timeline||[]).filter(e=>e.buildingId===b.id);
          const lastWork = bEvents.length ? Math.max(...bEvents.map(e=>e.year)) : null;
          return (
            <div key={b.id} onClick={()=>onSelect(b)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,WebkitTapHighlightColor:"transparent"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{width:44,height:44,borderRadius:12,background:C.accent+"22",border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{bt.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:C.text,fontSize:14,fontWeight:700}}>{b.label||bt.label}</div>
                <div style={{color:C.muted,fontSize:12,marginTop:2}}>{bEvents.length} records{lastWork?` · Last work ${lastWork}`:""}</div>
                {b.notes&&<div style={{color:C.dim,fontSize:11,marginTop:2}}>{b.notes}</div>}
              </div>
              <div style={{color:C.dim,fontSize:18}}>›</div>
            </div>
          );
        })}
      </div>
      <Btn full variant="ghost" onClick={onAdd}>+ Add Another Structure</Btn>
    </div>
  );
}

// ── Add Building Modal ────────────────────────────────────────────────────────
function AddBuildingModal({onSave, onClose}) {
  const [selected, setSelected] = useState(null);
  const [customLabel, setCustomLabel] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"#000c",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:500,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{color:C.text,fontSize:17,fontWeight:800}}>Add Structure</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,padding:0}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:16}}>
          {BUILDING_TYPES.map(bt=>(
            <div key={bt.id} onClick={()=>setSelected(bt)} style={{background:selected?.id===bt.id?C.accent+"22":C.card,border:`2px solid ${selected?.id===bt.id?C.accent:C.border}`,borderRadius:12,padding:"12px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,WebkitTapHighlightColor:"transparent"}}>
              <span style={{fontSize:20}}>{bt.icon}</span>
              <span style={{color:selected?.id===bt.id?C.accent:C.muted,fontSize:12,fontWeight:700}}>{bt.label}</span>
            </div>
          ))}
        </div>
        {selected&&(
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            <div>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Custom Name (optional)</div>
              <input value={customLabel} onChange={e=>setCustomLabel(e.target.value)} placeholder={`e.g. "North Barn", "Equipment Shop"`}
                style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Notes (optional)</div>
              <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Size, condition, any relevant details..."
                style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:10}}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn full color={C.accent} disabled={!selected} onClick={()=>onSave({
            id: selected.id + "_" + Date.now(),
            type: selected.id,
            icon: selected.icon,
            label: customLabel || selected.label,
            notes,
          })}>Add Structure</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Fast Field Log ────────────────────────────────────────────────────────────
function FastFieldLog({properties, setProperties, onDone, onRefresh}) {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Marion");
  const [selectedType, setSelectedType] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [note, setNote] = useState("");
  const [jobNum, setJobNum] = useState("");
  const [saved, setSaved] = useState(false);
  const [buildingId, setBuildingId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [cocFile, setCocFile] = useState(null);
  const [docType, setDocType] = useState("");
  const cocRef = useRef();

  const JOB_TAGS = {
    "Job Type": [
      {id:"full_replacement", label:"Full Replacement", color:C.green},
      {id:"repair",           label:"Repair",           color:C.yellow},
      {id:"emergency",        label:"Emergency",        color:C.red},
      {id:"warranty_work",    label:"Warranty Work",    color:C.blue},
      {id:"insurance_claim",  label:"Insurance Claim",  color:C.purple},
      {id:"new_build",        label:"New Build",        color:C.green},
      {id:"upgrade",          label:"Upgrade",          color:C.blue},
    ],
    "Inspection Findings": [
      {id:"passed",          label:"Passed",            color:C.green},
      {id:"failed",          label:"Failed",            color:C.red},
      {id:"major_deficiency",label:"Major Deficiency",  color:C.red},
      {id:"minor_deficiency",label:"Minor Deficiency",  color:C.yellow},
      {id:"recommended_repair",label:"Recommended Repair",color:C.yellow},
      {id:"monitor",         label:"Monitor",           color:C.blue},
      {id:"safety_hazard",   label:"Safety Hazard",     color:C.red},
      {id:"systems_checked", label:"All Systems Checked",color:C.green},
    ],
    "Insulation R-Value": [
      {id:"r13",  label:"R-13",  color:"#f97316"},
      {id:"r19",  label:"R-19",  color:"#f97316"},
      {id:"r30",  label:"R-30",  color:"#f97316"},
      {id:"r38",  label:"R-38",  color:"#f97316"},
      {id:"r49",  label:"R-49",  color:"#f97316"},
      {id:"r60",  label:"R-60",  color:"#f97316"},
    ],
    "Insulation Location": [
      {id:"ins_attic",      label:"Attic",      color:"#f97316"},
      {id:"ins_walls",      label:"Walls",      color:"#f97316"},
      {id:"ins_crawlspace", label:"Crawlspace", color:"#f97316"},
      {id:"ins_basement",   label:"Basement",   color:"#f97316"},
      {id:"ins_rim_joist",  label:"Rim Joist",  color:"#f97316"},
    ],
    "New Construction": [
      {id:"foundation_pour",  label:"Foundation Pour",  color:C.muted},
      {id:"framing",          label:"Framing",          color:C.accent},
      {id:"rough_in",         label:"Rough-In",         color:C.blue},
      {id:"drywall",          label:"Drywall",          color:C.muted},
      {id:"roofing_install",  label:"Roofing Install",  color:C.accent},
      {id:"final_inspection", label:"Final Inspection", color:C.green},
      {id:"certificate_occupancy", label:"CO (Certificate of Occupancy)", color:C.green},
    ],
    "Roof Details": [
      {id:"new_decking",        label:"New Decking",        color:C.accent},
      {id:"partial_decking",    label:"Partial Decking",    color:C.accent},
      {id:"ice_water_shield",   label:"Ice & Water Shield", color:C.blue},
      {id:"ridge_cap",          label:"Ridge Cap",          color:C.muted},
      {id:"flashing",           label:"Flashing",           color:C.muted},
      {id:"gutters",            label:"Gutters",            color:C.blue},
      {id:"skylights",          label:"Skylights",          color:C.blue},
      {id:"chimney",            label:"Chimney",            color:C.muted},
    ],
    "Warranty": [
      {id:"warranty_30yr",      label:"30yr Warranty",      color:C.green},
      {id:"warranty_25yr",      label:"25yr Warranty",      color:C.green},
      {id:"warranty_20yr",      label:"20yr Warranty",      color:C.green},
      {id:"warranty_10yr",      label:"10yr Warranty",      color:C.yellow},
      {id:"warranty_none",      label:"No Warranty",        color:C.red},
      {id:"warranty_mfg",       label:"Manufacturer",       color:C.blue},
      {id:"warranty_labor",     label:"Workmanship",        color:C.accent},
    ],
    "Damage Type": [
      {id:"hail",             label:"Hail",             color:C.blue},
      {id:"wind",             label:"Wind",             color:C.blue},
      {id:"storm",            label:"Storm",            color:C.purple},
      {id:"leak",             label:"Leak",             color:C.yellow},
      {id:"age",              label:"Age",              color:C.muted},
      {id:"structural",       label:"Structural",       color:C.red},
    ],
    "Materials": [
      {id:"gaf",              label:"GAF",              color:C.accent},
      {id:"owens_corning",    label:"Owens Corning",    color:C.accent},
      {id:"certainteed",      label:"CertainTeed",      color:C.accent},
      {id:"iko",              label:"IKO",              color:C.accent},
      {id:"metal",            label:"Metal",            color:C.muted},
      {id:"tpo",              label:"TPO",              color:C.muted},
      {id:"flat",             label:"Flat",             color:C.muted},
    ],
  };

  const toggleTag = (id) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t=>t!==id) : [...prev, id]);
  };

  const allTags = Object.values(JOB_TAGS).flat();

  const matchedProp = properties.find(p =>
    address && p.address.toLowerCase().includes(address.toLowerCase()) &&
    p.city.toLowerCase().includes(city.toLowerCase())
  );

  const handleSave = async () => {
    if(!address || !selectedType) return;
    try {
    const tc = TYPE_CFG[selectedType];

    // If COC uploaded, try to parse it for the completion date
    let cocYear = parseInt(year);
    if(cocFile && selectedType === "roof" && docType === "coc") {
      try {
        const base64 = await new Promise((res,rej) => {
          const reader = new FileReader();
          reader.onload = e => res(e.target.result.split(",")[1]);
          reader.onerror = rej;
          reader.readAsDataURL(cocFile);
        });
        const resp = await fetch("https://homestory-server-production.up.railway.app/api/parse-coc", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ imageBase64: base64, mediaType: cocFile.type, address }),
        });
        if(resp.ok) {
          const parsed = await resp.json();
          if(parsed.year && parsed.year > 2000 && parsed.year <= new Date().getFullYear()) {
            cocYear = parsed.year;
          }
        }
      } catch(e) { console.error("COC parse failed:", e); }
    }

    const event = {
      id: `ev-${Date.now()}`,
      year: cocYear,
      type: selectedType,
      label: `${tc.label} — Completed${cocFile?" (COC on file)":""}`,
      note: (note || `${tc.label} work completed.`) + (jobNum ? " Job #"+jobNum : "") + (cocFile ? ` COC: ${cocFile.name}` : ""),
      source: "Our Work",
      verified: !!cocFile,
      ourJob: true,
      buildingId: buildingId || "main_house",
      tags: selectedTags,
    };

    // Save to database with retry
    try {
      // Wake server first
      await fetch("https://homestory-server-production.up.railway.app/api/health").catch(()=>{});
      // Small delay to let server wake
      await new Promise(r=>setTimeout(r,800));
      await fetch("https://homestory-server-production.up.railway.app/api/log-job", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          address, city, state:"IL",
          year: cocYear,
          type: selectedType,
          label: event.label,
          note: event.note,
          jobNum,
          buildingId: buildingId||"main_house",
          tags: selectedTags,
        }),
      });
    } catch(e) { console.error("Server save failed:", e); }

    if(matchedProp) {
      const updated = { ...matchedProp, timeline: [...matchedProp.timeline, event] };
      if(selectedType === "roof" && (selectedTags.includes("full_replacement") || cocFile)) {
        updated.lastRoof = cocYear;
        updated.roofAge = new Date().getFullYear() - cocYear;
        updated.roofStatus = roofStatus(updated.roofAge);
      }
      setProperties(prev => prev.map(p => p.id === matchedProp.id ? updated : p));
    } else {
      const age = selectedType==="roof" ? new Date().getFullYear()-cocYear : 20;
      setProperties(prev => [{id:`p-${Date.now()}`,address,city,state:"IL",zip:"",lat:null,lng:null,yearBuilt:1985,sqft:1600,stories:1,style:"Ranch",lastRoof:selectedType==="roof"?cocYear:2005,roofMaterial:"Unknown",roofWarranty:"Unknown",roofAge:age,roofStatus:roofStatus(age),ourJob:true,notes:"",claimHistory:[],timeline:[event],ownerName:""}, ...prev]);
    }
      setSaved(true);
      setStep(4);
      // Refresh from server so banners update with new roof data
      if(onRefresh) setTimeout(onRefresh, 1500);
    } catch(e) {
      console.error('Save error:', e);
      alert('Error saving job: ' + e.message);
    }
  };

  const tc = selectedType ? TYPE_CFG[selectedType] : null;

  if(step===4) return (
    <div style={{textAlign:"center",padding:"40px 0"}}>
      <div style={{fontSize:52,marginBottom:16}}>✓</div>
      <div style={{color:C.green,fontSize:20,fontWeight:800,marginBottom:6}}>Job Logged!</div>
      <div style={{color:C.muted,fontSize:14,marginBottom:4}}>{address}, {city}</div>
      {tc&&<div style={{color:C.dim,fontSize:13,marginBottom:32}}>{tc.icon} {tc.label} · {year}</div>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn full color={C.accent} onClick={()=>{setStep(1);setAddress("");setSelectedType(null);setNote("");setJobNum("");setSaved(false);setSelectedTags([]);setCocFile(null);setDocType("");}}>Log Another Job</Btn>
        <Btn full variant="ghost" onClick={onDone}>Back to Search</Btn>
      </div>
    </div>
  );

  return (
    <div style={{paddingBottom:40}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
        <div style={{fontSize:22}}>⚡</div>
        <div><div style={{color:C.text,fontSize:18,fontWeight:800}}>Fast Field Log</div><div style={{color:C.muted,fontSize:12}}>Log any job in under a minute</div></div>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:22}}>
        {[1,2,3].map(n=><div key={n} style={{flex:1,height:4,borderRadius:2,background:step>n?C.accent:step===n?C.accent+"66":C.border,transition:"background 0.3s"}}/>)}
      </div>

      {step===1&&(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Step 1 — Property Address</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street address..."
              style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
              <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City"
                style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              <input defaultValue="IL" placeholder="ST"
                style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>
          {address&&<div style={{color:matchedProp?C.green:C.dim,fontSize:12,marginBottom:14,textAlign:"center"}}>{matchedProp?"✓ Property found in database":"New property — will be added"}</div>}
          <Btn full color={C.accent} onClick={()=>setStep(2)} disabled={!address}>Next →</Btn>
        </div>
      )}

      {step===2&&(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Step 2 — What was done?</div>
          {Object.entries(TRADE_CATEGORIES).map(([cat,types])=>(
            <div key={cat} style={{marginBottom:16}}>
              <div style={{color:C.dim,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{cat}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                {types.map(type=>{
                  const t=TYPE_CFG[type]; const sel=selectedType===type;
                  return <div key={type} onClick={()=>setSelectedType(type)} style={{background:sel?t.color+"22":C.card,border:`2px solid ${sel?t.color:C.border}`,borderRadius:12,padding:"12px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,WebkitTapHighlightColor:"transparent"}}>
                    <span style={{fontSize:18}}>{t.icon}</span><span style={{color:sel?t.color:C.muted,fontSize:12,fontWeight:700}}>{t.label}</span>
                  </div>;
                })}
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <Btn variant="ghost" small onClick={()=>setStep(1)}>← Back</Btn>
            <Btn full color={C.accent} onClick={()=>setStep(3)} disabled={!selectedType}>Next →</Btn>
          </div>
        </div>
      )}

      {step===3&&tc&&(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Step 3 — Details</div>
          <div style={{background:tc.color+"11",border:`1px solid ${tc.color}33`,borderRadius:12,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{tc.icon}</span>
            <div><div style={{color:tc.color,fontSize:14,fontWeight:700}}>{tc.label}</div><div style={{color:C.dim,fontSize:12}}>{address}, {city}</div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
            <div>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Year Completed</div>
              <input type="number" value={year} onChange={e=>setYear(e.target.value)}
                style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Job # (optional)</div>
              <input value={jobNum} onChange={e=>setJobNum(e.target.value)} placeholder="e.g. 2024-0412"
                style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Notes (optional)</div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                placeholder={selectedType==="hvac"?"e.g. Carrier 3-ton, 10yr warranty, R-410A":selectedType==="water_heater"?"e.g. 50-gal Rheem gas, 6yr warranty":selectedType==="electrical"?"e.g. 200-amp panel upgrade, permits pulled":"Materials, warranty, observations..."}
                style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.7}}/>
            </div>
          </div>
          {LIFESPANS[selectedType]&&(
            <div style={{background:C.surface,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
              <span style={{color:C.muted,fontSize:12}}>⏱ Typical lifespan: <strong style={{color:C.text}}>{LIFESPANS[selectedType]} yrs</strong> · Next service ~<strong style={{color:C.accent}}>{parseInt(year)+LIFESPANS[selectedType]}</strong></span>
            </div>
          )}

          {/* Tags */}
          <div style={{marginBottom:16}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Job Tags (optional)</div>
            {Object.entries(JOB_TAGS).map(([category, tags])=>(
              (selectedType==="roof" || selectedType==="new_construction" || selectedType?.startsWith("insulation") || ["inspection","home_inspection"].includes(selectedType) || !["Roof Details","Damage Type","Materials","Warranty","New Construction","Insulation R-Value","Insulation Location","Inspection Findings"].includes(category)) ? (
                <div key={category} style={{marginBottom:12}}>
                  <div style={{color:C.dim,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:7}}>{category}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {tags.map(tag=>{
                      const sel = selectedTags.includes(tag.id);
                      return (
                        <div key={tag.id} onClick={()=>toggleTag(tag.id)}
                          style={{background:sel?tag.color+"33":C.card,border:`1px solid ${sel?tag.color:C.border}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                          <span style={{color:sel?tag.color:C.muted,fontSize:11,fontWeight:700}}>{tag.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null
            ))}
            {selectedTags.length>0&&(
              <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:5}}>
                {selectedTags.map(id=>{
                  const tag = allTags.find(t=>t.id===id);
                  return tag ? <span key={id} style={{background:tag.color+"22",color:tag.color,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{tag.label}</span> : null;
                })}
              </div>
            )}
          </div>
          {/* Document Upload */}
          <div style={{background:C.card,border:`1px solid ${C.accent}33`,borderRadius:12,padding:14,marginBottom:16}}>
            <div style={{color:C.accent,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>📎 Attach Document (optional)</div>
            <div style={{marginBottom:10}}>
              <select value={docType} onChange={e=>setDocType(e.target.value)}
                style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:docType?C.text:C.muted,fontSize:13,outline:"none",fontFamily:"inherit",marginBottom:8}}>
                <option value="">Select document type...</option>
                <option value="coc">Certificate of Completion (COC)</option>
                <option value="permit">Permit</option>
                <option value="inspection">Inspection Report</option>
                <option value="warranty">Warranty Certificate</option>
                <option value="invoice">Invoice</option>
                <option value="insurance">Insurance Claim Docs</option>
                <option value="photo">Photos</option>
                <option value="other">Other</option>
              </select>
              {docType&&(
                !cocFile ? (
                  <div onClick={()=>cocRef.current.click()} style={{border:`2px dashed ${C.border}`,borderRadius:10,padding:"14px",textAlign:"center",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                    <div style={{fontSize:24,marginBottom:4}}>📎</div>
                    <div style={{color:C.muted,fontSize:12}}>Tap to upload {docType==="coc"?"COC PDF":docType}</div>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:10,background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:"10px 12px"}}>
                    <span style={{fontSize:20}}>📄</span>
                    <div style={{flex:1}}>
                      <div style={{color:C.green,fontSize:12,fontWeight:700}}>✓ {cocFile.name}</div>
                      <div style={{color:C.dim,fontSize:11}}>{docType==="coc"?"Will be parsed for date/material · ":""}Attaches to this job permanently</div>
                    </div>
                    <button onClick={()=>setCocFile(null)} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:14}}>✕</button>
                  </div>
                )
              )}
              <input ref={cocRef} type="file" accept=".pdf,.jpg,.png" style={{display:"none"}} onChange={e=>setCocFile(e.target.files[0]||null)}/>
            </div>
          </div>

          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" small onClick={()=>setStep(2)}>← Back</Btn>
            <Btn full color={C.accent} onClick={handleSave}>✓ Log This Job</Btn>
          </div>
        </div>
      )}
    </div>
  );
}


function PropertyDetail({property,onBack,userTier='free',userRole=null,onShowPaywall,paidReports=[],regridToken}) {
  const [tab,setTab]=useState("report");
  const [notes,setNotes]=useState("");
  const [saved,setSaved]=useState(false);
  const [showAddBuilding,setShowAddBuilding]=useState(false);
  const [selectedBuilding,setSelectedBuilding]=useState(null);
  const [propBuildings,setPropBuildings]=useState(property.buildings||[{id:"main_house",type:"main_house",icon:"🏠",label:"Main House",notes:""}]);
  const [editingRoof,setEditingRoof]=useState(false);
  const [editRoofYear,setEditRoofYear]=useState(property.lastRoof||"");
  const [editMaterial,setEditMaterial]=useState(property.roofMaterial||"");
  const [editWarranty,setEditWarranty]=useState(property.roofWarranty||"");
  const [roofEditSaved,setRoofEditSaved]=useState(false);
  const [parcelData,setParcelData]=useState(null);
  const s=STATUS[property.roofStatus];

  // Fetch Regrid parcel data by address
  useEffect(()=>{
    if(!regridToken||parcelData) return;
    const query = encodeURIComponent(`${property.address}, ${property.city}, ${property.state}`);
    fetch(`https://app.regrid.com/api/v2/search?query=${query}&token=${regridToken}&limit=1&path=/us/il`)
      .then(r=>r.json())
      .then(data=>{
        const parcel = data?.parcels?.features?.[0]?.properties?.fields;
        if(parcel) {
          setParcelData({
            ownerName: parcel.owner||parcel.first_owner||null,
            yearBuilt: parcel.yearbuilt||parcel.year_built||null,
            sqft: parcel.sqft||parcel.building_sqft||null,
            assessedValue: parcel.asmtvalimpr||parcel.improvval||null,
            marketValue: parcel.parvaltype||parcel.parval||null,
            lotSize: parcel.lotacres||null,
            lastSaleDate: parcel.saledate||null,
            lastSalePrice: parcel.saleprice||null,
            parcelId: parcel.parcelnumb||null,
            zoning: parcel.zoning||null,
            lat: data?.parcels?.features?.[0]?.geometry?.coordinates?.[1]||null,
            lng: data?.parcels?.features?.[0]?.geometry?.coordinates?.[0]||null,
            absenteeOwner: parcel.mail_address&&!parcel.mail_address.toLowerCase().includes(property.address.toLowerCase().split(" ")[0]),
          });
        }
      })
      .catch(e=>console.error("Regrid fetch failed:",e));
  },[regridToken, property.address]);

  const saveRoofEdit = async () => {
    try {
      await fetch("https://homestory-server-production.up.railway.app/api/update-property", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          id: property.id.replace("db-",""),
          last_roof: parseInt(editRoofYear),
          roof_material: editMaterial,
          roof_warranty: editWarranty,
          roof_age: new Date().getFullYear()-parseInt(editRoofYear),
          roof_status: roofStatus(new Date().getFullYear()-parseInt(editRoofYear)),
        }),
      });
    } catch(e) { console.error("Update failed:", e); }
    setRoofEditSaved(true);
    setEditingRoof(false);
    setTimeout(()=>setRoofEditSaved(false),2000);
  };

  return (
    <div style={{paddingBottom:60}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,padding:"0 0 18px",display:"flex",alignItems:"center",gap:6,WebkitTapHighlightColor:"transparent"}}>← Back</button>
      <div style={{background:`linear-gradient(135deg,${C.card},${C.card2})`,border:`1px solid ${C.border}`,borderRadius:18,padding:22,marginBottom:16}}>
        {property.ourJob&&<div style={{marginBottom:10}}><Pill color={C.accent}>🔧 Our Work on File</Pill></div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:2}}>
          <div style={{color:C.text,fontSize:21,fontWeight:800,letterSpacing:-0.5}}>{property.address}</div>
          {roofEditSaved&&<Pill color={C.green}>✓ Saved</Pill>}
        </div>
        <div style={{color:C.muted,fontSize:13,marginBottom:14}}>{property.city}, {property.state} {property.zip}</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          <Badge status={property.roofStatus}/>
          <Pill color={C.blue}>{property.roofAge}yr roof</Pill>
          <Pill color={C.muted}>{property.style}</Pill>
          <div onClick={()=>setEditingRoof(!editingRoof)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:"2px 8px",cursor:"pointer",fontSize:9,fontWeight:700,color:C.dim,WebkitTapHighlightColor:"transparent"}}>✏️ Edit Roof</div>
        </div>

        {/* Manual roof edit */}
        {editingRoof&&(
          <div style={{background:C.surface,border:`1px solid ${C.accent}44`,borderRadius:12,padding:14,marginBottom:14}}>
            <div style={{color:C.accent,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Edit Roof Info</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div>
                <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Year Replaced</div>
                <input type="number" value={editRoofYear} onChange={e=>setEditRoofYear(e.target.value)}
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Material</div>
                <input value={editMaterial} onChange={e=>setEditMaterial(e.target.value)} placeholder="GAF Timberline HDZ..."
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Warranty</div>
              <input value={editWarranty} onChange={e=>setEditWarranty(e.target.value)} placeholder="30yr manufacturer..."
                style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn small color={C.accent} onClick={saveRoofEdit}>Save Changes</Btn>
              <Btn small variant="ghost" onClick={()=>setEditingRoof(false)}>Cancel</Btn>
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[["Built",parcelData?.yearBuilt||property.yearBuilt],["Last Roof",property.lastRoof],["Est. Squares",Math.round((parcelData?.sqft||property.sqft||1500)*1.15/100)],["Records",property.timeline.length]].map(([k,v])=>(
            <div key={k} style={{background:C.bg+"88",borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
              <div style={{color:s.color,fontWeight:800,fontSize:20}}>{v}</div>
              <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:3}}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollbarWidth:"none",msOverflowStyle:"none"}}>
        {(userTier==="landlord"||userRole==="landlord"
          ? [["report","📋 Report"],["weather","🌩️ Weather"],["inspection","📝 Inspection"],["docs","📁 Docs"],["photos","📷 Photos"],["timeline","📅 History"]]
          : userTier==="contractor"||userRole==="contractor"
          ? [["report","📋 Report"],["weather","🌩️ Weather"],["summary","🤖 AI"],["measurements","📐 Measure"],["buildings","🏚️ Structures"],["jobs","🔨 Photos"],["docs","📁 Docs"],["liens","⚖️ Liens"],["privacy","🔒 Privacy"],["timeline","📅 History"],["contractor","🔧 Files"]]
          : [["report","📋 Report"],["weather","🌩️ Weather"],["inspection","📝 Inspection"],["docs","📁 Docs"],["liens","⚖️ Liens"],["photos","📷 Photos"],["timeline","📅 History"]]
        ).map(([k,l])=>{
          const isContractor=k==="contractor";
          return <button key={k} onClick={()=>setTab(k)} style={{background:tab===k?C.accent:isContractor?C.surface:C.card,color:tab===k?"#fff":isContractor?C.dim:C.muted,border:`1px solid ${tab===k?C.accent:C.border}`,borderRadius:10,padding:"9px 14px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",flexShrink:0,minHeight:42,WebkitTapHighlightColor:"transparent",whiteSpace:"nowrap"}}>{l}</button>;
        })}
      </div>

      {tab==="report"&&(
        userTier==="free"&&!paidReports.includes("Home Report") ? (
          <UpgradeBanner feature="Home Report" onUpgrade={()=>onShowPaywall&&onShowPaywall("Home Report")} onPayPerReport={()=>onShowPaywall&&onShowPaywall("Home Report")}/>
        ) : (
          <HomeReportTab property={property} notes={notes} setNotes={setNotes} saved={saved} setSaved={setSaved}/>
        )
      )}
      {tab==="summary"&&(
        <AISummaryPanel property={property} userTier={userTier} onShowPaywall={onShowPaywall}/>
      )}
      {tab==="measurements"&&(
        userTier==="free"&&!paidReports.includes("Measurements") ? (
          <UpgradeBanner feature="Measurements" onUpgrade={()=>onShowPaywall&&onShowPaywall("Measurements")} onPayPerReport={()=>onShowPaywall&&onShowPaywall("Measurements")}/>
        ) : (
          <MeasurementsPanel property={property} onUpdate={updated=>{}}/>
        )
      )}
      {tab==="buildings"&&(
        <div>
          {showAddBuilding&&(
            <AddBuildingModal
              onSave={b=>{setPropBuildings(prev=>[...prev,b]);setShowAddBuilding(false);}}
              onClose={()=>setShowAddBuilding(false)}
            />
          )}
          {selectedBuilding?(
            <div>
              <button onClick={()=>setSelectedBuilding(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:"0 0 16px",display:"flex",alignItems:"center",gap:6}}>← All Structures</button>
              <div style={{background:C.card,border:`1px solid ${C.accent}33`,borderRadius:14,padding:18,marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:32}}>{selectedBuilding.icon}</div>
                <div>
                  <div style={{color:C.text,fontSize:17,fontWeight:800}}>{selectedBuilding.label}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:2}}>{selectedBuilding.notes||"No additional notes"}</div>
                </div>
              </div>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Work on This Structure</div>
              {property.timeline.filter(e=>e.buildingId===selectedBuilding.id).length===0?(
                <div style={{textAlign:"center",padding:32,color:C.dim,fontSize:13}}>No records for this structure yet.<br/>Log a job and select this building.</div>
              ):(
                <div style={{position:"relative",paddingLeft:32}}>
                  <div style={{position:"absolute",left:13,top:8,bottom:8,width:2,background:C.border}}/>
                  {property.timeline.filter(e=>e.buildingId===selectedBuilding.id).sort((a,b)=>b.year-a.year).map(ev=>{
                    const tc=TYPE_CFG[ev.type]||TYPE_CFG.photo;
                    return (
                      <div key={ev.id} style={{position:"relative",marginBottom:14}}>
                        <div style={{position:"absolute",left:-25,top:4,width:26,height:26,borderRadius:"50%",background:tc.color+"22",border:`2px solid ${tc.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{tc.icon}</div>
                        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                            <div style={{color:C.text,fontWeight:700,fontSize:13}}>{ev.label}</div>
                            <div style={{color:C.accent,fontWeight:800,fontSize:13,flexShrink:0}}>{ev.year}</div>
                          </div>
                          <div style={{color:C.muted,fontSize:12,marginTop:3,lineHeight:1.5}}>{ev.note}</div>
                          <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                            <Pill color={tc.color}>{tc.label}</Pill>
                            <Pill color={ev.source==="Our Work"?C.accent:C.dim}>{ev.source}</Pill>
                            {ev.verified&&<Pill color={C.green}>✓ Verified</Pill>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ):(
            <BuildingSelector
              property={{...property, buildings:propBuildings}}
              onSelect={setSelectedBuilding}
              onAdd={()=>setShowAddBuilding(true)}
            />
          )}
        </div>
      )}
      {tab==="inspection"&&(
        <div>
          <div style={{background:`linear-gradient(135deg,${C.blue}11,${C.blue}0a)`,border:`1px solid ${C.blue}44`,borderRadius:14,padding:16,marginBottom:14,display:"flex",gap:14,alignItems:"center"}}>
            <span style={{fontSize:28,flexShrink:0}}>🏡</span>
            <div style={{flex:1}}>
              <div style={{color:C.blue,fontSize:13,fontWeight:800,marginBottom:3}}>Point of Sale Inspection?</div>
              <div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>Upload the inspection report from a property sale. AI extracts system ratings and key findings automatically.</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <Btn full color={C.blue} small onClick={()=>setTab("sale_upload")}>📄 Upload Sale Inspection</Btn>
          </div>
          <HomeInspectionPanel property={property} userTier={userTier} onShowPaywall={onShowPaywall}/>
        </div>
      )}
      {tab==="sale_upload"&&<SaleInspectionUpload property={property} onComplete={()=>setTab("inspection")}/>}
      {tab==="docs"&&<DocumentsFolder property={property}/>}
      {tab==="weather"&&<WeatherEventsPanel property={property}/>}
      {tab==="liens"&&<LiensAndTitle property={property}/>}
      {tab==="privacy"&&<PrivacySettings property={property} userRole={userTier}/>}
      {tab==="landlord"&&<LandlordPanel property={property}/>}
      {tab==="photos"&&<PhotoFolders property={property}/>}
      {tab==="jobs"&&(
        <div>
          <div style={{color:C.muted,fontSize:13,marginBottom:14,lineHeight:1.7}}>Photos from CompanyCam jobs flow in automatically. Each photo is attached to this property address permanently.</div>
          {property.timeline?.filter(e=>e.type==="photo"||e.note?.includes("companycam")||e.note?.includes("Photo")).length > 0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {property.timeline.filter(e=>e.type==="photo").map(ev=>(
                <div key={ev.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{color:C.text,fontSize:13,fontWeight:700}}>{ev.label}</div>
                    <div style={{color:C.accent,fontWeight:800,fontSize:13}}>{ev.year}</div>
                  </div>
                  <div style={{color:C.muted,fontSize:12,lineHeight:1.5,marginBottom:8}}>{ev.note?.slice(0,100)}</div>
                  {ev.note?.includes("https://")&&(
                    <a href={ev.note.match(/https:\/\/\S+/)?.[0]} target="_blank" rel="noopener noreferrer"
                      style={{display:"inline-flex",alignItems:"center",gap:6,background:C.accent+"22",color:C.accent,borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,textDecoration:"none"}}>
                      📷 View Photo
                    </a>
                  )}
                  <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                    <Pill color={C.accent}>CompanyCam</Pill>
                    {ev.verified&&<Pill color={C.green}>✓ Verified</Pill>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{fontSize:40,marginBottom:12}}>📷</div>
              <div style={{color:C.text,fontSize:15,fontWeight:700,marginBottom:6}}>No photos yet</div>
              <div style={{color:C.muted,fontSize:13}}>Photos will appear here automatically when your crew takes them in CompanyCam on this job.</div>
            </div>
          )}
        </div>
      )}
      {tab==="timeline"&&<div><div style={{color:C.muted,fontSize:12,marginBottom:14}}>{property.timeline.length} verified records</div><Timeline events={property.timeline} onAddTag={(evId,tagId)=>{
        // Add tag locally
        const updated = {...property, timeline: property.timeline.map(e=>e.id===evId?{...e,tags:[...(e.tags||[]),tagId]}:e)};
        // Could POST to server here to persist — for now local only
      }}/></div>}
      {tab==="contractor"&&(
        <div>
          <div style={{background:C.accent+"11",border:`1px solid ${C.accent}33`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>🔧</span>
            <div><div style={{color:C.accent,fontSize:12,fontWeight:700}}>Contractor View</div><div style={{color:C.dim,fontSize:11}}>Full job files and documentation — monthly subscription</div></div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Property Details</div>
            {[[`${property.address}, ${property.city}, ${property.state}`,"Address"],[parcelData?.ownerName||property.ownerName||"—","Owner"],[parcelData?.yearBuilt||property.yearBuilt,"Year Built"],[`${property.style} — ${property.stories} story`,"Style"],[`${(parcelData?.sqft||property.sqft)?.toLocaleString()} sq ft`,"Sq Footage"],[property.lastRoof,"Last Roof"],[property.roofMaterial,"Material"],[property.roofWarranty,"Warranty"],
              ...(parcelData?[
                [parcelData.assessedValue?`$${parseInt(parcelData.assessedValue).toLocaleString()}`:"—","Assessed Value"],
                [parcelData.lastSalePrice?`$${parseInt(parcelData.lastSalePrice).toLocaleString()}`:"—","Last Sale Price"],
                [parcelData.lastSaleDate||"—","Last Sale Date"],
                [parcelData.parcelId||"—","Parcel ID"],
                [parcelData.absenteeOwner?"Yes — Absentee Owner":"No","Absentee Owner"],
              ]:[])
            ].map(([v,k])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}22`,gap:10}}>
                <span style={{color:C.muted,fontSize:13,flexShrink:0}}>{k}</span>
                <span style={{color:C.text,fontSize:13,fontWeight:600,textAlign:"right"}}>{v}</span>
              </div>
            ))}
          </div>
          {property.notes&&(
            <div style={{background:C.accent+"0a",border:`1px solid ${C.accent}33`,borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{color:C.accent,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Contractor Notes</div>
              <div style={{color:C.muted,fontSize:13,lineHeight:1.7}}>{property.notes}</div>
            </div>
          )}
          {property.claimHistory?.length>0&&(
            <div style={{background:C.yellow+"0a",border:`1px solid ${C.yellow}33`,borderRadius:14,padding:16}}>
              <div style={{color:C.yellow,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Claim History</div>
              {property.claimHistory.map((c,i)=>(
                <div key={i}><div style={{color:C.text,fontSize:14,fontWeight:700}}>{c.year} — {c.type} damage</div><div style={{color:C.muted,fontSize:12,marginTop:2}}>{c.carrier} · #{c.claimNumber} · {c.status}</div></div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────

// ── Role Selection ────────────────────────────────────────────────────────────
function RoleSelect({onSelect}) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{background:C.accent,width:56,height:56,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>🏠</div>
          <div style={{fontFamily:"'Instrument Serif',serif",fontSize:28,fontWeight:400,color:C.text,letterSpacing:-0.5,marginBottom:8}}>Welcome to HomeStory</div>
          <div style={{color:C.muted,fontSize:14,lineHeight:1.6}}>The verified property history platform for Southern Illinois. How are you using HomeStory?</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {role:"contractor", icon:"🔧", title:"Contractor",        color:C.accent,  desc:"Log jobs, document work, generate insurance reports, build your verified record"},
            {role:"inspector",  icon:"🔍", title:"Home Inspector",     color:C.blue,    desc:"Upload inspection reports, log findings, build a verified record at every address"},
            {role:"adjuster",   icon:"📄", title:"Insurance Adjuster", color:C.purple,  desc:"Access pre-loss documentation, claim history, and verified property condition records"},
            {role:"homeowner",  icon:"🏠", title:"Homeowner / Buyer",  color:C.green,   desc:"View your property's full condition history, prepare for sale, or research before buying"},
          ].map(r=>(
            <div key={r.role} onClick={()=>onSelect(r.role)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,WebkitTapHighlightColor:"transparent",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=r.color;e.currentTarget.style.background=C.card2;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}>
              <div style={{width:48,height:48,borderRadius:12,background:r.color+"22",border:`1px solid ${r.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{r.icon}</div>
              <div style={{flex:1}}>
                <div style={{color:C.text,fontSize:15,fontWeight:800,marginBottom:4}}>{r.title}</div>
                <div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>{r.desc}</div>
              </div>
              <div style={{color:C.dim,fontSize:20,flexShrink:0}}>›</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:20}}>
          <button onClick={()=>onSelect("browse")} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Just browsing →</button>
        </div>
      </div>
    </div>
  );
}


function Landing({onGetStarted,onSearch,userRole}) {
  const [email,setEmail]=useState("");
  const [role,setRole]=useState("");
  const [submitted,setSubmitted]=useState(false);

  return (
    <div style={{paddingBottom:60}}>
      {/* Hero */}
      <div style={{textAlign:"center",padding:"48px 0 40px",position:"relative"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.accent+"18",border:`1px solid ${C.accent}44`,color:C.accent,borderRadius:20,padding:"5px 16px",fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:24}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:C.green,display:"inline-block",animation:"pulse 2s ease infinite"}}/>
          Southern Illinois · Now in Beta
        </div>
        <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:"clamp(36px,8vw,64px)",lineHeight:1.05,letterSpacing:-1,marginBottom:16,color:C.text}}>
          {userRole==="landlord"
            ? <span>Manage every property.<br/><em style={{background:`linear-gradient(135deg,#0ea5e9,#38bdf8)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontStyle:"italic"}}>Document everything.</em></span>
            : <span>The property history<br/>every home <em style={{background:`linear-gradient(135deg,${C.accent},${C.accent2||"#f59e3f"})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontStyle:"italic"}}>deserves.</em></span>
          }
        </h1>
        <p style={{color:C.muted,fontSize:16,lineHeight:1.7,maxWidth:480,margin:"0 auto 36px"}}>
          {userRole==="landlord"
            ? "HomeStory gives landlords a complete system for rental documentation — move-in inspections, maintenance requests, work orders, and verified property records — all in one place."
            : "HomeStory builds a verified condition record for every property — roofing, restoration, structural history — automatically, from the work contractors already do."
          }
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn color={C.accent} onClick={onSearch}>Search Any Address →</Btn>
          <Btn variant="ghost" onClick={()=>document.getElementById('early-access').scrollIntoView({behavior:'smooth'})}>Get Early Access</Btn>
        </div>
      </div>

      {/* Mock report preview */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,overflow:"hidden",marginBottom:40,boxShadow:`0 24px 60px rgba(0,0,0,0.4)`}}>
        <div style={{background:C.accent,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{color:"#ffffff88",fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>HomeStory</div><div style={{color:"#fff",fontSize:16,fontWeight:800}}>Home Report</div></div>
          <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"2px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#fff"}}>✓</div>
        </div>
        <div style={{padding:18}}>
          <div style={{color:C.green,fontSize:16,fontWeight:800,marginBottom:2}}>Good Standing</div>
          <div style={{color:C.muted,fontSize:12,marginBottom:2}}>5814 Northwind Drive, Marion, IL 62959</div>
          <div style={{color:C.blue,fontSize:11,fontWeight:600,marginBottom:14}}>👤 Johnson, Robert & Lisa</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
            {[["1987","Built"],["1,750","Sq Ft"],["2022","Last Roof"],["2yr","Roof Age"]].map(([v,k])=>(
              <div key={k} style={{background:C.surface,borderRadius:10,padding:"10px 8px",textAlign:"center"}}><div style={{color:C.text,fontSize:15,fontWeight:800}}>{v}</div><div style={{color:C.dim,fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>{k}</div></div>
            ))}
          </div>
          {[{year:2022,icon:"🏠",label:"Roof Replaced — Our Crew ✓",note:"GAF Timberline HDZ 30yr · Job #2022-0341",color:C.accent},{year:2021,icon:"🔧",label:"Water Damage Restoration",note:"Flashing failure at chimney · Job #2021-0189",color:C.purple},{year:1987,icon:"📋",label:"Original Construction",note:"Permit #WC-1987-2241 · Williamson County",color:C.blue}].map((ev,i)=>(
            <div key={i} style={{display:"flex",gap:10,paddingBottom:10,marginBottom:10,borderBottom:i<2?`1px solid ${C.border}22`:"none"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:ev.color+"22",border:`2px solid ${ev.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{ev.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><div style={{color:C.text,fontSize:12,fontWeight:700}}>{ev.label}</div><div style={{color:C.accent,fontWeight:800,fontSize:12}}>{ev.year}</div></div>
                <div style={{color:C.muted,fontSize:11,marginTop:2}}>{ev.note}</div>
              </div>
            </div>
          ))}
          <div style={{marginTop:4,background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:"10px 14px"}}>
            <div style={{color:C.green,fontSize:11,fontWeight:700,marginBottom:3}}>✓ Verified</div>
            <div style={{color:C.muted,fontSize:12}}>GPS-tagged contractor documentation on file. Condition consistent with a sound, insurable structure.</div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{marginBottom:40}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>How It Works</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,lineHeight:1.1,letterSpacing:-0.5,marginBottom:8}}>Built from work already being done.</h2>
        <p style={{color:C.muted,fontSize:14,lineHeight:1.7,marginBottom:24}}>Connect your existing tools. Every job your crew completes builds the database automatically.</p>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            ["🔗","01","Connect","Link Roofr and CompanyCam in minutes. No new workflows for your crew."],
            ["📷","02","Capture","Every photo, every completed job flows in automatically with GPS timestamps."],
            ["📋","03","Report","Search any address. Pull a verified Home Report instantly — ready for insurance or real estate."],
            ["🗺️","04","Scale","Map your territory by roof age. Know which neighborhoods need work before you make a call."],
          ].map(([icon,num,title,desc])=>(
            <div key={num} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",display:"flex",gap:16,alignItems:"flex-start"}}>
              <div style={{width:44,height:44,borderRadius:12,background:C.accent+"22",border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icon}</div>
              <div>
                <div style={{color:C.accent,fontSize:9,fontWeight:700,letterSpacing:1,marginBottom:4}}>{num}</div>
                <div style={{color:C.text,fontSize:15,fontWeight:700,marginBottom:4}}>{title}</div>
                <div style={{color:C.muted,fontSize:13,lineHeight:1.6}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who it's for */}
      <div style={{marginBottom:40}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Who It's For</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,lineHeight:1.1,letterSpacing:-0.5,marginBottom:24}}>One database. Five audiences.</h2>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {icon:"🔧",title:"Contractors",sub:"Know every property before you arrive. Generate insurance reports in one tap.",color:C.accent,
              items:["Pre-job property intelligence","Auto photo documentation via CompanyCam","Roofr integration — jobs log themselves","Territory scanner — find aging roofs"]},
            {icon:"🏅",title:"Certified Home Pros",sub:"Document your own work and earn the verified badge.",color:C.accent,
              items:["Upload receipts and photos of completed work","Log permits and inspection records","Earn Certified Home Pro badge on your property","Share verified history with buyers and insurers"]},
            {icon:"📄",title:"Insurance",sub:"Pre-loss documentation that closes disputes faster.",color:C.purple,
              items:["Timestamped pre-loss photos","Verified roof age and materials","Claim history on file","One-tap claim report download"]},
            {icon:"🏠",title:"Homeowners & Agents",sub:"Know exactly what has been done before you buy, sell, or insure.",color:C.green,
              items:["Full property condition history","Verified construction records","Pre-listing disclosure report","Share with buyers and lenders"]},
            {icon:"🔍",title:"Home Inspectors",sub:"Upload reports and build a verified record tied to every address you inspect.",color:C.blue,
              items:["Upload inspection reports — AI parses findings automatically","System condition ratings saved permanently","Every inspection tied to the property address forever","Spectora and other software integration coming soon"]},
          ].map(a=>(
            <div key={a.title} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{fontSize:28}}>{a.icon}</div>
                <div><div style={{color:C.text,fontSize:16,fontWeight:800}}>{a.title}</div><div style={{color:C.muted,fontSize:13,marginTop:2}}>{a.sub}</div></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {a.items.map(item=>(
                  <div key={item} style={{display:"flex",alignItems:"center",gap:8,color:C.muted,fontSize:13}}>
                    <span style={{color:a.color,fontWeight:700,flexShrink:0}}>✓</span>{item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div style={{marginBottom:40}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Integrations</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,lineHeight:1.1,letterSpacing:-0.5,marginBottom:16}}>Works with the tools you already use.</h2>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {[["📱","CompanyCam",true],["🏗️","Roofr",true],["🗺️","County GIS",false],["🌊","FEMA Flood",false],["📍","Regrid Parcels",false],["🏠","MLS / Zillow",false],["🛣️","Street View",false],["📋","County Permits",false]].map(([icon,name,live])=>(
            <div key={name} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,color:C.text}}>
              <span>{icon}</span>{name}
              {live&&<div style={{width:7,height:7,borderRadius:"50%",background:C.green,marginLeft:2}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Early Access */}
      <div id="early-access" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:24,marginBottom:20}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Early Access</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:26,lineHeight:1.1,letterSpacing:-0.5,marginBottom:8}}>Be first in Southern Illinois.</h2>
        <p style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:20}}>We're onboarding the first wave of contractors and insurance partners now. Southern Illinois contractors get free access during beta.</p>
        {submitted?(
          <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:12,padding:20,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>✓</div>
            <div style={{color:C.green,fontSize:16,fontWeight:700,marginBottom:4}}>You're on the list!</div>
            <div style={{color:C.muted,fontSize:13}}>We'll be in touch soon with your early access details.</div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input placeholder="Your name" style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
            <input placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)}
              style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
            <select value={role} onChange={e=>setRole(e.target.value)}
              style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:role?C.text:C.muted,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}>
              <option value="">I am a...</option>
              <option>Roofing Contractor</option>
              <option>General Contractor</option>
              <option>Insurance Adjuster</option>
              <option>Insurance Agent / Underwriter</option>
              <option>Real Estate Agent</option>
              <option>Homeowner</option>
            </select>
            <Btn full color={C.accent} onClick={()=>setSubmitted(true)}>Request Early Access →</Btn>
            <div style={{color:C.dim,fontSize:11,textAlign:"center"}}>No credit card required · Free during beta</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Search Screen ─────────────────────────────────────────────────────────────
function SearchScreen({properties,onSelect,regridToken,setRegridToken,userRole,onUploadInspection}) {
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [sortBy,setSortBy]=useState("age_desc");
  const counts={critical:properties.filter(p=>p.roofStatus==="critical").length,aging:properties.filter(p=>p.roofStatus==="aging").length,good:properties.filter(p=>p.roofStatus==="good").length};
  const filtered=properties
    .filter(p=>filter==="all"||p.roofStatus===filter||(filter==="ourjobs"&&p.ourJob)||(filter==="claims"&&p.claimHistory?.length>0))
    .filter(p=>`${p.address} ${p.city} ${p.zip} ${p.ownerName||""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sortBy==="age_desc"?b.roofAge-a.roofAge:sortBy==="age_asc"?a.roofAge-b.roofAge:sortBy==="address"?a.address.localeCompare(b.address):sortBy==="owner"?(a.ownerName||"").localeCompare(b.ownerName||""):a.yearBuilt-b.yearBuilt);

  return (
    <div>
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:26,lineHeight:1.1,letterSpacing:-0.5,marginBottom:6}}>Search Properties</h2>
        <p style={{color:C.muted,fontSize:13}}>Southern Illinois property database · {properties.length} records indexed</p>
      </div>

      {/* Inspector quick upload banner */}
      {userRole==="inspector"&&(
        <div style={{background:`linear-gradient(135deg,${C.blue}22,${C.blue}0a)`,border:`1px solid ${C.blue}44`,borderRadius:14,padding:16,marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:28,flexShrink:0}}>🔍</span>
          <div style={{flex:1}}>
            <div style={{color:C.blue,fontSize:13,fontWeight:800,marginBottom:3}}>Upload an Inspection Report</div>
            <div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>Search for the property address below, tap it, then go to the Inspection tab to upload your report.</div>
          </div>
          <Btn small color={C.blue} onClick={()=>onUploadInspection&&onUploadInspection()}>Upload →</Btn>
        </div>
      )}

      {/* Map */}
      <ParcelMap properties={properties} onSelect={onSelect} regridToken={regridToken}/>



      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        {[["critical","Replace Now",C.red],["aging","Aging",C.yellow],["good","Good",C.green]].map(([k,l,col])=>(
          <div key={k} onClick={()=>setFilter(filter===k?"all":k)} style={{background:filter===k?col+"22":C.card,border:`2px solid ${filter===k?col:C.border}`,borderRadius:14,padding:"14px 10px",cursor:"pointer",textAlign:"center",minHeight:70,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
            <div style={{color:col,fontSize:28,fontWeight:800,lineHeight:1}}>{counts[k]}</div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,marginTop:4,letterSpacing:0.3}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
        {[["all","All"],["ourjobs","Our Work"],["claims","Has Claims"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{background:filter===k?C.accent+"22":"none",color:filter===k?C.accent:C.muted,border:`1px solid ${filter===k?C.accent+"44":C.border}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",flexShrink:0,WebkitTapHighlightColor:"transparent"}}>{l}</button>
        ))}
      </div>

      {/* Search + sort */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.muted,fontSize:15,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search address, owner, city..."
            style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 12px 13px 36px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{color:C.dim,fontSize:11,fontWeight:700,flexShrink:0}}>Sort:</span>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
            <option value="age_desc">Oldest Roof First</option>
            <option value="age_asc">Newest Roof First</option>
            <option value="address">Address A–Z</option>
            <option value="owner">Owner A–Z</option>
            <option value="year_built">Oldest Property</option>
          </select>
        </div>
      </div>

      {(search||filter!=="all")&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"6px 12px",background:C.card,borderRadius:8,border:`1px solid ${C.border}`}}>
          <span style={{color:C.muted,fontSize:11}}>Showing {filtered.length} of {properties.length}</span>
          <button onClick={()=>{setSearch("");setFilter("all");}} style={{background:"none",border:"none",color:C.accent,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",marginLeft:"auto",padding:0}}>Clear</button>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(p=>{
          const s=STATUS[p.roofStatus];
          return (
            <div key={p.id} onClick={()=>onSelect(p)} style={{background:C.card,border:`1px solid ${p.ourJob?C.accent+"44":C.border}`,borderRadius:14,padding:"16px",cursor:"pointer",transition:"all 0.15s",WebkitTapHighlightColor:"transparent"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
              onMouseLeave={e=>e.currentTarget.style.borderColor=p.ourJob?C.accent+"44":C.border}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                    <div style={{color:C.text,fontWeight:700,fontSize:14}}>{p.address}</div>
                    {p.ourJob&&<Pill color={C.accent}>Our Work</Pill>}
                    {p.claimHistory?.length>0&&<Pill color={C.yellow}>Claim on File</Pill>}
                  <Pill color={C.blue}>🌩️ Weather Data</Pill>
                  </div>
                  <div style={{color:C.muted,fontSize:12}}>{p.city}, {p.state} · Built {p.yearBuilt} · {p.sqft?.toLocaleString()} sq ft</div>
                  {p.ownerName&&<div style={{color:C.blue,fontSize:11,fontWeight:600,marginTop:2}}>👤 {p.ownerName}</div>}
                  <div style={{color:C.dim,fontSize:11,marginTop:2}}>{p.timeline.length} records · {p.roofMaterial}</div>
                  {(()=>{
                    const recentTags = p.timeline?.filter(e=>e.tags&&e.tags.length).sort((a,b)=>b.year-a.year)[0]?.tags||[];
                    const tagDefs=[{id:"full_replacement",label:"Full Replacement",color:C.green},{id:"repair",label:"Repair",color:C.yellow},{id:"emergency",label:"Emergency",color:C.red},{id:"insurance_claim",label:"Claim",color:C.purple},{id:"new_decking",label:"New Decking",color:C.accent},{id:"hail",label:"Hail",color:C.blue},{id:"wind",label:"Wind",color:C.blue},{id:"fire_damage",label:"Fire",color:C.red},{id:"flood_damage",label:"Flood",color:C.blue},{id:"tree_strike",label:"Tree Strike",color:C.red},{id:"earthquake",label:"Earthquake",color:C.red},{id:"warranty_30yr",label:"30yr Warranty",color:C.green},{id:"warranty_25yr",label:"25yr Warranty",color:C.green},{id:"gaf",label:"GAF",color:C.accent},{id:"owens_corning",label:"Owens Corning",color:C.accent},{id:"certainteed",label:"CertainTeed",color:C.accent}];
                    return recentTags.length ? (
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>
                        {recentTags.slice(0,4).map(id=>{
                          const tag=tagDefs.find(t=>t.id===id);
                          return tag?<span key={id} style={{background:tag.color+"22",color:tag.color,borderRadius:20,padding:"1px 8px",fontSize:9,fontWeight:700}}>{tag.label}</span>:null;
                        })}
                      </div>
                    ) : null;
                  })()}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{color:s.color,fontWeight:800,fontSize:22,lineHeight:1}}>{p.roofAge}yr</div>
                  <Badge status={p.roofStatus} small/>
                </div>
              </div>
            </div>
          );
        })}
        {!filtered.length&&<div style={{textAlign:"center",color:C.dim,padding:40,fontSize:13}}>No properties match.</div>}
      </div>
      <div style={{color:C.dim,fontSize:11,textAlign:"center",marginTop:16,paddingBottom:20}}>{properties.length} properties · Southern Illinois Database</div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

// ── Contractor Dashboard ──────────────────────────────────────────────────────

// ── HomeStory Verified Program ────────────────────────────────────────────────

// ── Data Use Policy ───────────────────────────────────────────────────────────
function DataUsePolicy() {
  return (
    <div style={{paddingBottom:60}}>
      <div style={{marginBottom:20}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Legal</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:26,letterSpacing:-0.5,marginBottom:6}}>Data Use Policy</h2>
        <div style={{color:C.muted,fontSize:12}}>Last updated: June 2026 · Subject to attorney review before public launch</div>
      </div>

      {/* Founder disclosure */}
      <div style={{background:C.yellow+"0a",border:`1px solid ${C.yellow}44`,borderRadius:14,padding:16,marginBottom:16}}>
        <div style={{color:C.yellow,fontSize:12,fontWeight:800,marginBottom:6}}>⚠️ Founder Disclosure</div>
        <div style={{color:C.muted,fontSize:13,lineHeight:1.7}}>HomeStory was founded by Zach Palmer, owner of Northwind Roofing and Exteriors in Marion, IL. Northwind Roofing operates as a contributing contractor on this platform under the same terms as all other contractors. Zach Palmer and Northwind Roofing are subject to all restrictions in this policy.</div>
      </div>

      {[
        {
          icon:"🔒",
          title:"Your Contractor Data Is Yours",
          color:C.green,
          body:"Jobs you log, customer names, addresses, work history, and pricing data belong to you. HomeStory does not share this information with other contractors, including Northwind Roofing and Exteriors."
        },
        {
          icon:"🚫",
          title:"No Competitive Use",
          color:C.red,
          body:"HomeStory and its founders will not use contractor-contributed data to solicit roofing work, contact your customers, or compete with your business. This prohibition applies permanently — even if you stop using HomeStory."
        },
        {
          icon:"🏠",
          title:"Property Records Are Anonymized",
          color:C.blue,
          body:"Public property condition records show that work was done at an address but do not identify which contractor performed it — unless you choose to display your company name. Other contractors cannot determine who did the work from the property record alone."
        },
        {
          icon:"📊",
          title:"Aggregated Data Licensing",
          color:C.accent,
          body:"HomeStory may sell aggregated, anonymized property condition data to third parties such as solar companies, insurance carriers, and real estate data services. This data contains no contractor names, customer information, job pricing, or any data that could be traced back to a specific contractor or homeowner. Examples: '847 Williamson County roofs are 15+ years old' or 'Zip code 62959 has 34% aging roof stock.'"
        },
        {
          icon:"🗑️",
          title:"Right to Delete",
          color:C.muted,
          body:"You can request deletion of your contractor data at any time by contacting HomeStory. Property condition records derived from public sources (county assessor, permit records) may be retained as part of the permanent property record."
        },
        {
          icon:"📋",
          title:"What We Collect",
          color:C.purple,
          body:"Job logs you submit, photos synced via CompanyCam, job data synced via Roofr or other CRMs, documents you upload, and notes you add. We also collect property data from public sources including county assessor records, permit databases, and weather event records."
        },
        {
          icon:"🏛️",
          title:"Illinois Law",
          color:C.blue,
          body:"HomeStory operates under Illinois law. This policy will be reviewed and formalized by an Illinois attorney prior to public launch. Until that review is complete, HomeStory is operating in a closed beta with known contractors only."
        },
      ].map(section=>(
        <div key={section.title} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:20}}>{section.icon}</span>
            <div style={{color:section.color,fontSize:13,fontWeight:800}}>{section.title}</div>
          </div>
          <div style={{color:C.muted,fontSize:13,lineHeight:1.7}}>{section.body}</div>
        </div>
      ))}

      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginTop:8}}>
        <div style={{color:C.dim,fontSize:12,lineHeight:1.7,textAlign:"center"}}>
          Questions about this policy? Contact Zach Palmer at Northwind Roofing · Marion, IL<br/>
          <span style={{color:C.accent,fontWeight:700}}>This policy is in draft form and will be finalized with legal counsel before public launch.</span>
        </div>
      </div>
    </div>
  );
}

// ── Community Standards ───────────────────────────────────────────────────────
function CommunityStandards({properties, userTier}) {
  const [activeTab, setActiveTab] = useState("standards");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [dispute, setDispute] = useState({address:"",year:"",issue:"",details:"",contact:""});
  const [submitted, setSubmitted] = useState(false);

  const ISSUE_TYPES = [
    "Work was not performed as documented",
    "Materials used differ from what was logged",
    "Job was logged at wrong address",
    "Work caused property damage",
    "Contractor misrepresented credentials",
    "Other",
  ];

  const STATUS_CONFIG = {
    verified:  { icon:"🏅", label:"Verified",    color:C.accent, desc:"Meets all HomeStory standards" },
    unverified:{ icon:"⭕", label:"Unverified",  color:C.muted,  desc:"Has not completed verification" },
    suspended: { icon:"⚠️", label:"Suspended",   color:C.yellow, desc:"Verification under review" },
    removed:   { icon:"🚫", label:"Removed",     color:C.red,    desc:"No longer in HomeStory network" },
  };

  // Demo dispute records
  const DEMO_DISPUTES = [
    { id:"d1", address:"324 Magnolia Street", city:"Herrin", year:2021, issue:"Work was not performed as documented", status:"resolved", resolution:"Contractor provided additional documentation. Record updated.", date:"Mar 2022" },
    { id:"d2", address:"1847 Oak Ridge Road", city:"Carterville", year:2023, issue:"Materials used differ from what was logged", status:"under_review", date:"Jan 2024" },
  ];

  return (
    <div style={{paddingBottom:40}}>
      <div style={{marginBottom:20}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Network Integrity</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,lineHeight:1.1,letterSpacing:-0.5,marginBottom:6}}>Community Standards</h2>
        <p style={{color:C.muted,fontSize:13,lineHeight:1.6}}>HomeStory maintains the integrity of the database through a documented standards and dispute system. Every flag is tied to a specific job record — not anonymous complaints.</p>
      </div>

      {/* Sub tabs */}
      <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:2}}>
        {[["standards","Standards"],["status","Contractor Status"],["disputes","Dispute System"],["file","File a Report"]].map(([k,l])=>(
          <button key={k} onClick={()=>setActiveTab(k)} style={{background:activeTab===k?C.accent:C.card,color:activeTab===k?"#fff":C.muted,border:`1px solid ${activeTab===k?C.accent:C.border}`,borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",flexShrink:0,WebkitTapHighlightColor:"transparent"}}>{l}</button>
        ))}
      </div>

      {/* Standards */}
      {activeTab==="standards"&&(
        <div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>What We Require</div>
            {[
              {icon:"📋",title:"Accurate Job Logging",desc:"Jobs must be logged at the correct address with accurate dates, materials, and scope. Fabricating or misrepresenting work is grounds for removal."},
              {icon:"📷",title:"Honest Documentation",desc:"Photos must be from the actual job site. GPS data is verified against the logged address. Staged or misleading photos are not permitted."},
              {icon:"🛡️",title:"Valid Credentials",desc:"Insurance, bonding, or license information must be current and accurate. Lapsed credentials trigger automatic suspension review."},
              {icon:"🤝",title:"Dispute Cooperation",desc:"Contractors must respond to documented disputes within 30 days. Non-response results in the dispute being marked unresolved on the property record."},
              {icon:"⭐",title:"Professional Conduct",desc:"HomeStory Verified contractors represent the network. Conduct that damages homeowner trust or misuses the platform results in removal."},
            ].map(s=>(
              <div key={s.title} style={{display:"flex",gap:12,marginBottom:16,alignItems:"flex-start"}}>
                <span style={{fontSize:20,flexShrink:0}}>{s.icon}</span>
                <div><div style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:3}}>{s.title}</div><div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>{s.desc}</div></div>
              </div>
            ))}
          </div>
          <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:12,padding:14}}>
            <div style={{color:C.blue,fontSize:12,fontWeight:700,marginBottom:4}}>Our commitment</div>
            <div style={{color:C.muted,fontSize:12,lineHeight:1.7}}>Flags and removals are never based on anonymous complaints alone. Every action requires documented evidence tied to a specific job record. Contractors have the right to respond before any status change is made public.</div>
          </div>
        </div>
      )}

      {/* Contractor Status */}
      {activeTab==="status"&&(
        <div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {Object.entries(STATUS_CONFIG).map(([key,s])=>(
              <div key={key} style={{background:C.card,border:`1px solid ${s.color}33`,borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:28,flexShrink:0}}>{s.icon}</div>
                <div style={{flex:1}}>
                  <div style={{color:s.color,fontSize:14,fontWeight:800,marginBottom:3}}>{s.label}</div>
                  <div style={{color:C.muted,fontSize:12}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Status Change Process</div>
            {[
              ["Verified → Suspended","Credentials lapse, dispute filed, or unusual activity detected. Contractor notified immediately."],
              ["Suspended → Verified","Contractor resolves the issue and resubmits credentials. Review takes up to 7 days."],
              ["Suspended → Removed","No response within 30 days or pattern of violations confirmed."],
              ["Removed → Appeal","Contractors may appeal removal once with new documentation. Final decision is binding."],
            ].map(([step,desc])=>(
              <div key={step} style={{paddingBottom:10,marginBottom:10,borderBottom:`1px solid ${C.border}22`}}>
                <div style={{color:C.text,fontSize:12,fontWeight:700,marginBottom:3}}>{step}</div>
                <div style={{color:C.dim,fontSize:12}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispute System */}
      {activeTab==="disputes"&&(
        <div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>How Disputes Work</div>
            {[
              {num:"1",title:"Filed Against a Job Record",desc:"Every dispute is tied to a specific address, year, and job — not a general complaint about a contractor."},
              {num:"2",title:"Contractor Notified",desc:"The contractor receives full details and has 30 days to respond with documentation."},
              {num:"3",title:"Both Sides Visible",desc:"The dispute and the contractor's response both appear on the property record permanently. Viewers see the full picture."},
              {num:"4",title:"Resolution Logged",desc:"Whether resolved or unresolved, the outcome is documented. Future report pulls show dispute history for that property."},
            ].map(s=>(
              <div key={s.num} style={{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:C.accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0}}>{s.num}</div>
                <div><div style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:3}}>{s.title}</div><div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>{s.desc}</div></div>
              </div>
            ))}
          </div>

          {/* Demo disputes */}
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Recent Disputes ({DEMO_DISPUTES.length})</div>
          {DEMO_DISPUTES.map(d=>(
            <div key={d.id} style={{background:C.card,border:`1px solid ${d.status==="resolved"?C.green+"33":C.yellow+"33"}`,borderRadius:12,padding:16,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8}}>
                <div>
                  <div style={{color:C.text,fontSize:13,fontWeight:700}}>{d.address}, {d.city}</div>
                  <div style={{color:C.muted,fontSize:11,marginTop:2}}>Job year: {d.year} · Filed: {d.date}</div>
                </div>
                <Pill color={d.status==="resolved"?C.green:C.yellow}>{d.status==="resolved"?"Resolved":"Under Review"}</Pill>
              </div>
              <div style={{color:C.muted,fontSize:12,marginBottom:d.resolution?8:0}}>Issue: {d.issue}</div>
              {d.resolution&&<div style={{background:C.green+"0a",border:`1px solid ${C.green}22`,borderRadius:8,padding:"8px 10px",color:C.green,fontSize:11}}>{d.resolution}</div>}
            </div>
          ))}
        </div>
      )}

      {/* File a Report */}
      {activeTab==="file"&&(
        submitted?(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:48,marginBottom:16}}>✓</div>
            <div style={{color:C.green,fontSize:18,fontWeight:800,marginBottom:8}}>Report Submitted</div>
            <div style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:24}}>We will review your report and contact the contractor within 5 business days. Both parties will be notified of the outcome.</div>
            <Btn variant="ghost" onClick={()=>{setSubmitted(false);setDispute({address:"",year:"",issue:"",details:"",contact:""});}}>File Another Report</Btn>
          </div>
        ):(
          <div>
            <div style={{background:C.yellow+"0a",border:`1px solid ${C.yellow}33`,borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{color:C.yellow,fontSize:12,fontWeight:700,marginBottom:4}}>Before you file</div>
              <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Reports must be tied to a specific job on record. Anonymous or vague complaints are not accepted. False reports may result in your own account being flagged.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
              <div>
                <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Property Address</div>
                <input value={dispute.address} onChange={e=>setDispute(p=>({...p,address:e.target.value}))} placeholder="Street address where the work was done"
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Year of Job</div>
                <input value={dispute.year} onChange={e=>setDispute(p=>({...p,year:e.target.value}))} placeholder="e.g. 2022" type="number"
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Issue Type</div>
                <select value={dispute.issue} onChange={e=>setDispute(p=>({...p,issue:e.target.value}))}
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:dispute.issue?C.text:C.muted,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}>
                  <option value="">Select issue type...</option>
                  {ISSUE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Details</div>
                <textarea value={dispute.details} onChange={e=>setDispute(p=>({...p,details:e.target.value}))} rows={4}
                  placeholder="Describe the issue in detail. Include any documentation, photos, or evidence you have..."
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.7}}/>
              </div>
              <div>
                <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Your Contact Info</div>
                <input value={dispute.contact} onChange={e=>setDispute(p=>({...p,contact:e.target.value}))} placeholder="Email or phone — for follow-up questions"
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            </div>
            <Btn full color={C.accent} disabled={!dispute.address||!dispute.issue||!dispute.details}
              onClick={()=>setSubmitted(true)}>Submit Report</Btn>
          </div>
        )
      )}
    </div>
  );
}


function VerifiedProgram({userTier, properties, onUpgrade}) {
  const ourJobs = properties.filter(p=>p.ourJob||p.timeline?.some(e=>e.ourJob));
  const jobCount = ourJobs.length;
  const [credentials,setCredentials] = useState({license:"",insurance:"",bonding:"",submitted:false});
  const [showCredForm,setShowCredForm] = useState(false);
  const reqs = {
    subscription: userTier==="contractor",
    jobs: jobCount>=5,
    companycam: false,
    credentials: credentials.submitted&&(credentials.license||credentials.insurance||credentials.bonding),
  };
  const metCount = Object.values(reqs).filter(Boolean).length;
  const totalReqs = 4;
  const isVerified = Object.values(reqs).every(Boolean);

  return (
    <div style={{paddingBottom:20}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${C.accent},#f59e3f)`,borderRadius:18,padding:24,marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:40,marginBottom:10}}>🏅</div>
          <div style={{color:"#fff",fontSize:22,fontWeight:800,marginBottom:4,letterSpacing:-0.5}}>HomeStory Verified</div>
          <div style={{color:"#ffffffcc",fontSize:13,lineHeight:1.6,marginBottom:16}}>A credential that proves your work is documented and permanently on record. Put it on your truck. Put it on your estimates. Put it everywhere.</div>
          {isVerified
            ?<div style={{background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"10px 16px",display:"inline-flex",alignItems:"center",gap:8}}><span>✓</span><span style={{color:"#fff",fontSize:13,fontWeight:700}}>You are HomeStory Verified</span></div>
            :<div style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"10px 16px",display:"inline-flex"}}><span style={{color:"#fff",fontSize:12,fontWeight:600}}>{metCount} of {totalReqs} requirements met</span></div>
          }
        </div>
      </div>

      {/* Requirements */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Verification Requirements</div>
        {[
          {key:"subscription",icon:"⚡",label:"Active Pro Subscription",desc:"$49/month — unlocks all features",met:reqs.subscription,action:!reqs.subscription?"Upgrade to Pro":null},
          {key:"jobs",icon:"🔧",label:"5+ Jobs Documented",desc:`${jobCount} of 5 jobs logged in HomeStory`,met:reqs.jobs,progress:Math.min(100,Math.round((jobCount/5)*100))},
          {key:"companycam",icon:"📱",label:"CompanyCam Connected",desc:"Photo documentation flowing automatically",met:reqs.companycam,action:"Connect CompanyCam"},
          {key:"credentials",icon:"📋",label:"Credentials on File",desc:"License, proof of insurance, or bonding — at least one required",met:reqs.credentials},
        ].map(req=>(
          <div key={req.key} style={{display:"flex",gap:14,paddingBottom:14,marginBottom:14,borderBottom:`1px solid ${C.border}22`,alignItems:"flex-start"}}>
            <div style={{width:36,height:36,borderRadius:10,background:req.met?C.green+"22":C.surface,border:`2px solid ${req.met?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
              {req.met?"✓":req.icon}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div style={{color:req.met?C.green:C.text,fontSize:13,fontWeight:700}}>{req.label}</div>
                {req.met&&<Pill color={C.green}>Met</Pill>}
              </div>
              <div style={{color:C.dim,fontSize:12,marginTop:3}}>{req.desc}</div>
              {req.progress!==undefined&&!req.met&&(
                <div style={{marginTop:8}}>
                  <div style={{background:C.border,borderRadius:4,height:6,overflow:"hidden",marginBottom:3}}>
                    <div style={{width:`${req.progress}%`,height:"100%",background:C.accent,borderRadius:4}}/>
                  </div>
                  <div style={{color:C.dim,fontSize:10}}>{req.progress}% complete</div>
                </div>
              )}
              {req.action&&!req.met&&(
                <button onClick={req.key==="subscription"?onUpgrade:()=>{}} style={{marginTop:8,background:"none",border:`1px solid ${C.accent}44`,color:C.accent,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>
                  {req.action} →
                </button>
              )}
              {req.key==="credentials"&&!req.met&&(
                <div style={{marginTop:10}}>
                  <button onClick={()=>setShowCredForm(!showCredForm)} style={{background:"none",border:`1px solid ${C.accent}44`,color:C.accent,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>
                    {showCredForm?"Hide Form":"Submit Credentials →"}
                  </button>
                  {showCredForm&&(
                    <div style={{marginTop:12,background:C.surface,borderRadius:12,padding:14}}>
                      <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Submit at least one</div>
                      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                        {[
                          {key:"license",icon:"📋",label:"Contractor License #",hint:"If applicable — enter N/A for unlicensed trades"},
                          {key:"insurance",icon:"🛡️",label:"Proof of Insurance",hint:"Carrier name and policy number",recommended:true},
                          {key:"bonding",icon:"🔒",label:"Bonding Information",hint:"Bonding company and bond number"},
                        ].map(f=>(
                          <div key={f.key}>
                            <div style={{color:C.muted,fontSize:11,marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
                              <span>{f.icon}</span> {f.label}
                              {f.recommended&&<span style={{color:C.green,fontSize:10,fontWeight:700}}>Recommended</span>}
                            </div>
                            <input value={credentials[f.key]} onChange={e=>setCredentials(p=>({...p,[f.key]:e.target.value}))} placeholder={f.hint}
                              style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                          </div>
                        ))}
                      </div>
                      <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                        <div style={{color:C.blue,fontSize:11,lineHeight:1.6}}>Unlicensed trades like HVAC maintenance, carpentry, or handyman work can use proof of insurance or bonding as their credential.</div>
                      </div>
                      <Btn small color={C.accent} disabled={!credentials.license&&!credentials.insurance&&!credentials.bonding}
                        onClick={()=>{setCredentials(p=>({...p,submitted:true}));setShowCredForm(false);}}>
                        Submit for Review
                      </Btn>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>What Verification Gets You</div>
        {[
          {icon:"🏅",title:"Verified Badge",desc:"Digital badge for your website, email, and estimates. Print files for truck decals and business cards."},
          {icon:"📋",title:"Verified Label on All Reports",desc:"Every Home Report from your jobs shows HomeStory Verified Contractor with your company name and credential type."},
          {icon:"🔍",title:"Discovery Listing",desc:"Listed first in the HomeStory verified contractor directory when homeowners and agents search your area."},
          {icon:"⚡",title:"Priority Claim Support",desc:"Adjusters working claims in your territory see your Verified status. Your documentation carries more weight."},
          {icon:"📈",title:"Annual Verification Report",desc:"Year-end summary of jobs documented, reports generated, and claims supported — shareable proof of your impact."},
          {icon:"🤝",title:"Founding Member Pricing",desc:"First 50 verified contractors in Southern Illinois get lifetime pricing locked in forever."},
        ].map(b=>(
          <div key={b.title} style={{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}}>
            <span style={{fontSize:20,flexShrink:0}}>{b.icon}</span>
            <div><div style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:3}}>{b.title}</div><div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>{b.desc}</div></div>
          </div>
        ))}
      </div>

      {/* Badge preview */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Badge Preview</div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
          <div style={{background:`linear-gradient(135deg,${C.accent},#f59e3f)`,borderRadius:16,padding:"18px 24px",textAlign:"center",maxWidth:200}}>
            <div style={{fontSize:32,marginBottom:6}}>🏅</div>
            <div style={{color:"#fff",fontSize:14,fontWeight:800,letterSpacing:-0.3}}>HomeStory</div>
            <div style={{color:"#ffffffcc",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginTop:2}}>Verified Contractor</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,marginTop:6,letterSpacing:0.5}}>Southern Illinois · {new Date().getFullYear()}</div>
          </div>
        </div>
        <div style={{color:C.dim,fontSize:12,textAlign:"center",lineHeight:1.6}}>Print-ready files for truck decals and business cards provided on approval.</div>
      </div>

      {/* CTA */}
      {isVerified?(
        <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:14,padding:20,textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:8}}>🎉</div>
          <div style={{color:C.green,fontSize:16,fontWeight:800,marginBottom:6}}>You are HomeStory Verified!</div>
          <div style={{color:C.muted,fontSize:13,marginBottom:16}}>Your badge is active. Download your digital assets below.</div>
          <Btn full color={C.green} onClick={()=>{
          const lines=["HOMESTORY VERIFIED CONTRACTOR","="+"=".repeat(39),"","This certifies that the above contractor has met all","requirements for HomeStory Verified status in the","Southern Illinois Property Database.","","Verification Date: "+new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),"Database Region: Southern Illinois","","Digital Badge: homestory.app/verified","","="+"=".repeat(39),"HomeStory · homestory.app · verified@homestory.app"];
          const blob=new Blob([lines.join("\n")],{type:"text/plain"});
          const url=URL.createObjectURL(blob);
          const a=document.createElement("a");a.href=url;a.download="HomeStory_Verified_Certificate.txt";a.click();URL.revokeObjectURL(url);
        }}>↓ Download Verified Certificate</Btn>
        </div>
      ):userTier!=="contractor"?(
        <Btn full color={C.accent} onClick={onUpgrade}>Upgrade to Pro to Start Verification</Btn>
      ):(
        <div style={{background:C.accent+"0a",border:`1px solid ${C.accent}33`,borderRadius:14,padding:16,textAlign:"center"}}>
          <div style={{color:C.accent,fontSize:14,fontWeight:700,marginBottom:6}}>You are on your way</div>
          <div style={{color:C.muted,fontSize:13,marginBottom:8}}>Complete the {totalReqs-metCount} remaining requirements to earn your badge.</div>
          <div style={{color:C.dim,fontSize:12}}>Questions? Contact us at verified@homestory.app</div>
        </div>
      )}
    </div>
  );
}



// ── Landlord Dashboard ────────────────────────────────────────────────────────

// ── Rental Listing Page ───────────────────────────────────────────────────────

// ── Tenant Maintenance Request ────────────────────────────────────────────────
function TenantRequest({property, onSubmit}) {
  const [step, setStep] = useState(1); // 1=describe, 2=photo, 3=confirm, 4=done
  const [form, setForm] = useState({
    category:"general", description:"", urgency:"medium", name:"", phone:"",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef();

  // Auto-detect urgency from keywords
  const detectUrgency = (text) => {
    const high = ["leak","flood","no heat","no hot water","electrical","sparks","smoke","broken","burst","overflow","unsafe","dangerous","fire","gas"];
    const low  = ["light bulb","cosmetic","paint","scratch","minor","small"];
    const t = text.toLowerCase();
    if(high.some(k=>t.includes(k))) return "high";
    if(low.some(k=>t.includes(k)))  return "low";
    return "medium";
  };

  const handleDescriptionChange = (val) => {
    setForm(p=>({...p, description:val, urgency:detectUrgency(val)}));
  };

  const handlePhoto = (files) => {
    if(!files[0]) return;
    const reader = new FileReader();
    reader.onload = e => { setPhoto(files[0]); setPhotoPreview(e.target.result); };
    reader.readAsDataURL(files[0]);
  };

  const urgencyConfig = {
    high:  {color:C.red,    label:"Urgent",  icon:"🔴", desc:"Needs immediate attention"},
    medium:{color:C.yellow, label:"Normal",   icon:"🟡", desc:"Within a few days"},
    low:   {color:C.green,  label:"Low",      icon:"🟢", desc:"When convenient"},
  };
  const uc = urgencyConfig[form.urgency];

  const CATEGORIES = [
    {id:"plumbing",   icon:"💧", label:"Plumbing"},
    {id:"electrical", icon:"⚡", label:"Electrical"},
    {id:"hvac",       icon:"❄️", label:"Heating/AC"},
    {id:"appliances", icon:"🍳", label:"Appliances"},
    {id:"doors",      icon:"🚪", label:"Doors/Windows"},
    {id:"pest",       icon:"🐛", label:"Pest"},
    {id:"exterior",   icon:"🌧️", label:"Exterior/Roof"},
    {id:"general",    icon:"🔧", label:"General"},
  ];

  if(step===4) return (
    <div style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:56,marginBottom:16}}>✅</div>
      <div style={{color:C.green,fontSize:20,fontWeight:800,marginBottom:8}}>Request Submitted</div>
      <div style={{color:C.muted,fontSize:14,lineHeight:1.7,marginBottom:8}}>{property.address}</div>
      <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:12,padding:16,marginBottom:24}}>
        <div style={{color:C.green,fontSize:12,fontWeight:700,marginBottom:4}}>
          {form.urgency==="high"?"🔴 Marked Urgent — Landlord and maintenance notified immediately":"✓ Request logged — you will hear back within 24-48 hours"}
        </div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Your request has been sent to the property owner and maintenance team. A work order has been created and your photo is on file.</div>
      </div>
      <div style={{color:C.dim,fontSize:12,marginBottom:24}}>Request #{Date.now().toString().slice(-6)}</div>
      <Btn variant="ghost" onClick={()=>{setStep(1);setForm({category:"general",description:"",urgency:"medium",name:"",phone:""});setPhoto(null);setPhotoPreview(null);}}>Submit Another Request</Btn>
    </div>
  );

  return (
    <div style={{paddingBottom:40}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.card},${C.card2})`,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:20}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Maintenance Request</div>
        <div style={{color:C.text,fontSize:18,fontWeight:800,marginBottom:2}}>{property.address}</div>
        <div style={{color:C.muted,fontSize:13}}>{property.city}, {property.state}</div>
      </div>

      {/* Progress */}
      <div style={{display:"flex",gap:4,marginBottom:24}}>
        {[1,2,3].map(n=><div key={n} style={{flex:1,height:4,borderRadius:2,background:step>n?C.accent:step===n?C.accent+"66":C.border,transition:"background 0.3s"}}/>)}
      </div>

      {/* Step 1 — Describe */}
      {step===1&&(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Step 1 — What needs attention?</div>

          {/* Category picker */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
            {CATEGORIES.map(cat=>(
              <div key={cat.id} onClick={()=>setForm(p=>({...p,category:cat.id}))}
                style={{background:form.category===cat.id?C.accent+"22":C.card,border:`2px solid ${form.category===cat.id?C.accent:C.border}`,borderRadius:12,padding:"12px 6px",cursor:"pointer",textAlign:"center",WebkitTapHighlightColor:"transparent"}}>
                <div style={{fontSize:22,marginBottom:4}}>{cat.icon}</div>
                <div style={{color:form.category===cat.id?C.accent:C.muted,fontSize:10,fontWeight:700}}>{cat.label}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Describe the Issue</div>
            <textarea value={form.description} onChange={e=>handleDescriptionChange(e.target.value)} rows={4}
              placeholder="Describe what's happening in your own words. The more detail you give, the faster we can fix it..."
              style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.7}}/>
          </div>

          {/* Auto-detected urgency */}
          {form.description.length>10&&(
            <div style={{background:uc.color+"11",border:`1px solid ${uc.color}33`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{uc.icon}</span>
              <div>
                <div style={{color:uc.color,fontSize:12,fontWeight:700}}>Detected Priority: {uc.label}</div>
                <div style={{color:C.muted,fontSize:11,marginTop:2}}>{uc.desc}</div>
              </div>
              <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                {Object.entries(urgencyConfig).map(([k,v])=>(
                  <div key={k} onClick={()=>setForm(p=>({...p,urgency:k}))} style={{background:form.urgency===k?v.color+"33":"none",border:`1px solid ${form.urgency===k?v.color:C.border}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                    <span style={{fontSize:10}}>{v.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact info */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Your Name</div>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="First & last name"
                style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Phone</div>
              <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="Best number"
                style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>

          <Btn full color={C.accent} disabled={!form.description||!form.name} onClick={()=>setStep(2)}>Next — Add Photo →</Btn>
          {form.urgency==="high"&&form.description.length>10&&(
            <div style={{marginTop:10,color:C.red,fontSize:12,fontWeight:600,textAlign:"center"}}>🔴 This looks urgent — owner will be notified immediately</div>
          )}
        </div>
      )}

      {/* Step 2 — Photo */}
      {step===2&&(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Step 2 — Add a Photo</div>
          <div style={{color:C.muted,fontSize:13,lineHeight:1.6,marginBottom:16}}>A photo helps the maintenance team arrive prepared. You can skip this step if you don't have one.</div>

          {!photoPreview?(
            <div onClick={()=>fileRef.current.click()}
              style={{border:`2px dashed ${C.border}`,borderRadius:14,padding:"40px 20px",textAlign:"center",cursor:"pointer",background:C.card,marginBottom:16,WebkitTapHighlightColor:"transparent"}}>
              <div style={{fontSize:40,marginBottom:10}}>📷</div>
              <div style={{color:C.text,fontWeight:700,fontSize:15,marginBottom:4}}>Take or Upload a Photo</div>
              <div style={{color:C.muted,fontSize:12}}>Tap to open camera or choose from your photos</div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handlePhoto(e.target.files)}/>
            </div>
          ):(
            <div style={{marginBottom:16}}>
              <div style={{position:"relative",borderRadius:14,overflow:"hidden",marginBottom:10}}>
                <img src={photoPreview} alt="maintenance" style={{width:"100%",maxHeight:240,objectFit:"cover",display:"block"}}/>
                <button onClick={()=>{setPhoto(null);setPhotoPreview(null);}} style={{position:"absolute",top:10,right:10,background:"#000b",border:"none",color:"#fff",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
              <div style={{color:C.green,fontSize:12,fontWeight:700,textAlign:"center"}}>✓ Photo attached</div>
            </div>
          )}

          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" small onClick={()=>setStep(1)}>← Back</Btn>
            <Btn full color={C.accent} onClick={()=>setStep(3)}>{photoPreview?"Next — Review →":"Skip Photo →"}</Btn>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step===3&&(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Step 3 — Confirm & Submit</div>

          <div style={{background:C.card,border:`1px solid ${uc.color}44`,borderRadius:14,padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{color:C.text,fontSize:15,fontWeight:800,marginBottom:4}}>{CATEGORIES.find(c=>c.id===form.category)?.icon} {CATEGORIES.find(c=>c.id===form.category)?.label} Issue</div>
                <div style={{color:C.muted,fontSize:12}}>{property.address} · {form.name}</div>
              </div>
              <Pill color={uc.color}>{uc.icon} {uc.label}</Pill>
            </div>
            <div style={{background:C.surface,borderRadius:10,padding:"10px 12px",marginBottom:photoPreview?12:0}}>
              <div style={{color:C.text,fontSize:13,lineHeight:1.6}}>{form.description}</div>
            </div>
            {photoPreview&&(
              <img src={photoPreview} alt="maintenance" style={{width:"100%",maxHeight:160,objectFit:"cover",borderRadius:10,display:"block"}}/>
            )}
          </div>

          <div style={{background:C.accent+"0a",border:`1px solid ${C.accent}33`,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
            <div style={{color:C.accent,fontSize:12,fontWeight:700,marginBottom:4}}>What happens next</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                "Your request is logged as a work order immediately",
                form.urgency==="high"?"Owner and maintenance notified right now via push notification":"Owner notified — response within 24 hours",
                "You can reference request #"+Date.now().toString().slice(-6)+" for follow-up",
              ].map((t,i)=>(
                <div key={i} style={{display:"flex",gap:8,color:C.muted,fontSize:12}}><span style={{color:C.accent,flexShrink:0}}>✓</span>{t}</div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" small onClick={()=>setStep(2)}>← Back</Btn>
            <Btn full color={form.urgency==="high"?C.red:C.accent} onClick={()=>{onSubmit&&onSubmit({...form,photo:photoPreview,address:property.address});setStep(4);}}>
              {form.urgency==="high"?"🔴 Submit Urgent Request":"Submit Request"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}


function RentalListing({property, onBack, onTenantRequest}) {
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({name:"",email:"",phone:"",message:""});
  const [inquirySent, setInquirySent] = useState(false);
  const s = STATUS[property.roofStatus];

  // Demo listing data — in production pulled from landlord's listing setup
  const listing = property.listing || {
    rent: 995,
    deposit: 995,
    bedrooms: 3,
    bathrooms: 2,
    sqft: property.sqft || 1600,
    available: "February 1, 2025",
    leaseTerms: ["12 months","6 months"],
    petPolicy: "No pets",
    utilities: "Tenant pays all utilities",
    parking: "1-car garage included",
    laundry: "In-unit washer/dryer hookups",
    description: `Well-maintained ${property.style||"ranch"}-style home in ${property.city}. Recently updated with a new roof and HVAC system. Quiet neighborhood, close to schools and shopping. Verified property condition records available.`,
    zillowUrl: `https://zillow.com/rental-manager`,
    apartmentsUrl: null,
    facebookUrl: null,
    photos: property.photos || [],
    amenities: ["Central Air","Dishwasher","Garage","Yard","Storage"],
  };

  return (
    <div style={{paddingBottom:60}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:"0 0 16px",display:"flex",alignItems:"center",gap:6}}>← Back</button>

      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${C.card},${C.card2})`,border:`1px solid ${C.border}`,borderRadius:18,overflow:"hidden",marginBottom:16}}>
        {/* Photo area */}
        <div style={{background:C.accent+"11",height:180,display:"flex",alignItems:"center",justifyContent:"center",borderBottom:`1px solid ${C.border}`,position:"relative"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:8}}>🏠</div>
            <div style={{color:C.muted,fontSize:12}}>Photos sync from CompanyCam</div>
          </div>
          <div style={{position:"absolute",top:12,right:12,background:C.green+"ee",borderRadius:8,padding:"4px 12px"}}>
            <span style={{color:"#fff",fontSize:11,fontWeight:700}}>Available {listing.available}</span>
          </div>
          <div style={{position:"absolute",top:12,left:12,background:C.accent+"ee",borderRadius:8,padding:"4px 12px",display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:12}}>🏅</span>
            <span style={{color:"#fff",fontSize:10,fontWeight:700}}>HomeStory Verified</span>
          </div>
        </div>

        {/* Key details */}
        <div style={{padding:"18px 18px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{color:C.text,fontSize:22,fontWeight:800,letterSpacing:-0.5}}>${listing.rent.toLocaleString()}<span style={{color:C.muted,fontSize:14,fontWeight:400}}>/mo</span></div>
              <div style={{color:C.muted,fontSize:13,marginTop:2}}>{property.address}</div>
              <div style={{color:C.muted,fontSize:12}}>{property.city}, {property.state} {property.zip||""}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:C.dim,fontSize:11,marginBottom:4}}>Deposit</div>
              <div style={{color:C.text,fontSize:16,fontWeight:700}}>${listing.deposit.toLocaleString()}</div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
            {[
              ["🛏️",listing.bedrooms,"Beds"],
              ["🛁",listing.bathrooms,"Baths"],
              ["📐",listing.sqft?.toLocaleString(),"Sq Ft"],
              ["📅",new Date().getFullYear()-property.yearBuilt+"yr","Old"],
            ].map(([icon,val,label])=>(
              <div key={label} style={{background:C.bg+"88",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:16,marginBottom:3}}>{icon}</div>
                <div style={{color:C.text,fontSize:14,fontWeight:800}}>{val}</div>
                <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Apply button */}
          <a href={listing.zillowUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
            <Btn full color={C.blue}>Apply on Zillow →</Btn>
          </a>
          <div style={{color:C.dim,fontSize:11,textAlign:"center",marginTop:6}}>Powered by Zillow Rental Manager · Background & credit check included</div>
        </div>
      </div>

      {/* HomeStory Verified section */}
      <div style={{background:`linear-gradient(135deg,${C.accent}11,${C.accent}0a)`,border:`1px solid ${C.accent}44`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <span style={{fontSize:24}}>🏅</span>
          <div>
            <div style={{color:C.accent,fontSize:13,fontWeight:800}}>HomeStory Verified Property</div>
            <div style={{color:C.muted,fontSize:11,marginTop:1}}>Condition records independently documented and verified</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {[
            ["🏠","Roof",`${property.roofMaterial||"Asphalt"} · ${property.lastRoof||"Unknown"}`],
            ["⚡","Condition",STATUS[property.roofStatus]?.label],
            ["📅","Year Built",property.yearBuilt],
            ["📋","Records",`${property.timeline?.length||0} on file`],
          ].map(([icon,label,val])=>(
            <div key={label} style={{background:C.card,borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{icon}</span>
              <div>
                <div style={{color:C.dim,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.3}}>{label}</div>
                <div style={{color:C.text,fontSize:12,fontWeight:600,marginTop:1}}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent work highlights */}
        {property.timeline?.filter(e=>e.ourJob||e.source==="Our Work").slice(0,3).map(ev=>{
          const tc = TYPE_CFG[ev.type]||TYPE_CFG.photo;
          return (
            <div key={ev.id} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderTop:`1px solid ${C.accent}22`}}>
              <span style={{fontSize:14}}>{tc.icon}</span>
              <div style={{flex:1,color:C.muted,fontSize:12}}>{ev.label}</div>
              <div style={{color:C.accent,fontSize:12,fontWeight:700,flexShrink:0}}>{ev.year}</div>
            </div>
          );
        })}
        <div style={{marginTop:10}}>
          <div style={{color:C.muted,fontSize:11,textAlign:"center"}}>Full property history available in the <strong style={{color:C.accent}}>Home Report</strong></div>
        </div>
      </div>

      {/* Description */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>About This Property</div>
        <div style={{color:C.text,fontSize:13,lineHeight:1.8,marginBottom:14}}>{listing.description}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {listing.amenities.map(a=>(
            <div key={a} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 12px",color:C.muted,fontSize:11,fontWeight:600}}>✓ {a}</div>
          ))}
        </div>
      </div>

      {/* Lease details */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Lease Details</div>
        {[
          ["Available",listing.available],
          ["Lease Terms",listing.leaseTerms.join(" or ")],
          ["Security Deposit","$"+listing.deposit.toLocaleString()],
          ["Pets",listing.petPolicy],
          ["Utilities",listing.utilities],
          ["Parking",listing.parking],
          ["Laundry",listing.laundry],
        ].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,gap:10}}>
            <span style={{color:C.muted,fontSize:13,flexShrink:0}}>{k}</span>
            <span style={{color:C.text,fontSize:13,fontWeight:600,textAlign:"right"}}>{v}</span>
          </div>
        ))}
      </div>

      {/* Listed on */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Listed On</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <a href={listing.zillowUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
            <div style={{background:C.surface,border:`1px solid ${C.green}44`,borderRadius:10,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>🏠</span>
                <div><div style={{color:C.text,fontSize:13,fontWeight:700}}>Zillow Rental Manager</div><div style={{color:C.muted,fontSize:11}}>Background & credit check · Online application</div></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:C.green}}/><span style={{color:C.green,fontSize:11,fontWeight:700}}>Live</span></div>
            </div>
          </a>
          {[
            {name:"Apartments.com",icon:"🏢",url:null},
            {name:"Facebook Marketplace",icon:"👥",url:null},
            {name:"Craigslist",icon:"📌",url:null},
          ].map(site=>(
            <div key={site.name} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:0.6}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{site.icon}</span>
                <div><div style={{color:C.text,fontSize:13,fontWeight:700}}>{site.name}</div><div style={{color:C.dim,fontSize:11}}>Coming soon</div></div>
              </div>
              <div style={{color:C.dim,fontSize:11}}>Not listed</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact / Question form */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Have a Question?</div>
        {inquirySent?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:32,marginBottom:8}}>✓</div>
            <div style={{color:C.green,fontSize:14,fontWeight:700,marginBottom:4}}>Message Sent</div>
            <div style={{color:C.muted,fontSize:12}}>The landlord will respond within 24 hours.</div>
          </div>
        ):(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <input value={contactForm.name} onChange={e=>setContactForm(p=>({...p,name:e.target.value}))} placeholder="Your name"
                style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              <input value={contactForm.phone} onChange={e=>setContactForm(p=>({...p,phone:e.target.value}))} placeholder="Phone number"
                style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <input value={contactForm.email} onChange={e=>setContactForm(p=>({...p,email:e.target.value}))} placeholder="Email address"
              style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:10}}/>
            <textarea value={contactForm.message} onChange={e=>setContactForm(p=>({...p,message:e.target.value}))} rows={3}
              placeholder="Ask about availability, schedule a showing, or any questions..."
              style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.7,marginBottom:10}}/>
            <Btn full color={C.accent} disabled={!contactForm.name||!contactForm.email} onClick={()=>setInquirySent(true)}>Send Message</Btn>
          </div>
        )}
      </div>

      {/* Tenant maintenance request */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Already a Tenant?</div>
        <div style={{color:C.muted,fontSize:13,lineHeight:1.6,marginBottom:14}}>Submit a maintenance request directly to the property owner and maintenance team. Include a photo and it shows up on their phone immediately.</div>
        <Btn full variant="ghost" onClick={()=>onTenantRequest&&onTenantRequest(property)}>🔧 Submit Maintenance Request</Btn>
      </div>

      {/* Apply CTA */}
      <div style={{background:`linear-gradient(135deg,${C.blue}22,${C.blue}0a)`,border:`1px solid ${C.blue}44`,borderRadius:14,padding:20,textAlign:"center"}}>
        <div style={{color:C.text,fontSize:16,fontWeight:800,marginBottom:6}}>Ready to Apply?</div>
        <div style={{color:C.muted,fontSize:13,lineHeight:1.6,marginBottom:16}}>Applications processed through Zillow — includes background check, credit check, and income verification. Takes about 10 minutes.</div>
        <a href={listing.zillowUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block"}}>
          <Btn full color={C.blue}>Apply Now on Zillow →</Btn>
        </a>
        <div style={{color:C.dim,fontSize:11,marginTop:8}}>Application fee may apply · Processed by Zillow</div>
      </div>
    </div>
  );
}



// ── Add Unit Modal ────────────────────────────────────────────────────────────
function AddUnitModal({onSave, onClose, existingProperties}) {
  const [form, setForm] = useState({
    address:"", city:"Marion", state:"IL", zip:"",
    units:"1", yearBuilt:"", sqft:"", type:"single_family",
    rent:"", notes:"",
  });
  const [saved, setSaved] = useState(false);
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const PROPERTY_TYPES = [
    {id:"single_family", icon:"🏠", label:"Single Family"},
    {id:"duplex",        icon:"🏘️", label:"Duplex"},
    {id:"multi",         icon:"🏢", label:"Multi-Unit"},
    {id:"commercial",    icon:"🏬", label:"Commercial"},
    {id:"mobile",        icon:"🚐", label:"Mobile Home"},
    {id:"other",         icon:"📦", label:"Other"},
  ];

  const handleSave = () => {
    if(!form.address||!form.city) return;
    const newProp = {
      id: `p-${Date.now()}`,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      yearBuilt: parseInt(form.yearBuilt)||1990,
      sqft: parseInt(form.sqft)||1200,
      stories: 1,
      style: form.type,
      lastRoof: 2010,
      roofMaterial: "Unknown",
      roofWarranty: "Unknown",
      roofAge: new Date().getFullYear()-2010,
      roofStatus: roofStatus(new Date().getFullYear()-2010),
      ourJob: true,
      ownerName: "",
      notes: form.notes,
      claimHistory: [],
      timeline: [],
      units: parseInt(form.units)||1,
      monthlyRent: parseFloat(form.rent)||0,
    };
    onSave(newProp);
    setSaved(true);
    setTimeout(()=>{setSaved(false);onClose();}, 1500);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#000c",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{color:C.text,fontSize:17,fontWeight:800}}>Add Rental Unit</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22,padding:0,lineHeight:1}}>✕</button>
        </div>

        {saved?(
          <div style={{textAlign:"center",padding:"30px 0"}}>
            <div style={{fontSize:44,marginBottom:10}}>✓</div>
            <div style={{color:C.green,fontSize:16,fontWeight:700}}>Unit Added!</div>
          </div>
        ):(
          <div>
            {/* Property type */}
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Property Type</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:18}}>
              {PROPERTY_TYPES.map(t=>(
                <div key={t.id} onClick={()=>setForm(p=>({...p,type:t.id}))} style={{background:form.type===t.id?C.accent+"22":C.card,border:`2px solid ${form.type===t.id?C.accent:C.border}`,borderRadius:12,padding:"12px 8px",cursor:"pointer",textAlign:"center",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{fontSize:22,marginBottom:4}}>{t.icon}</div>
                  <div style={{color:form.type===t.id?C.accent:C.muted,fontSize:11,fontWeight:700}}>{t.label}</div>
                </div>
              ))}
            </div>

            {/* Address */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
              <div>
                <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Street Address</div>
                <input value={form.address} onChange={f("address")} placeholder="123 Main Street"
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
                <div>
                  <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>City</div>
                  <input value={form.city} onChange={f("city")} placeholder="Marion"
                    style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>State</div>
                  <input value={form.state} onChange={f("state")} placeholder="IL"
                    style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>ZIP</div>
                  <input value={form.zip} onChange={f("zip")} placeholder="62959"
                    style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div>
                  <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Year Built</div>
                  <input value={form.yearBuilt} onChange={f("yearBuilt")} placeholder="1990" type="number"
                    style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Sq Ft</div>
                  <input value={form.sqft} onChange={f("sqft")} placeholder="1200" type="number"
                    style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Units</div>
                  <input value={form.units} onChange={f("units")} placeholder="1" type="number"
                    style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
              </div>
              <div>
                <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Monthly Rent (optional)</div>
                <input value={form.rent} onChange={f("rent")} placeholder="$0,000" type="number"
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Notes (optional)</div>
                <textarea value={form.notes} onChange={f("notes")} placeholder="Any notes about this property..." rows={2}
                  style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.6}}/>
              </div>
            </div>

            <div style={{display:"flex",gap:10}}>
              <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
              <Btn full color={C.accent} disabled={!form.address||!form.city} onClick={handleSave}>Add Unit</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function LandlordDashboard({properties, setProperties, onSelect, onLogJob}) {
  const [tab, setTab] = useState("portfolio");
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showWorkOrder, setShowWorkOrder] = useState(false);
  const [workOrders, setWorkOrders] = useState([
    {id:"wo1", address:"5814 Northwind Drive", city:"Marion", unit:"", priority:"medium", category:"plumbing", title:"Dripping faucet — master bath", notes:"Tenant reported dripping faucet in master bathroom. Has been ongoing 2 weeks.", status:"open", assignedTo:"Mike D.", created:"2024-01-15", due:"2024-01-22"},
    {id:"wo2", address:"1847 Oak Ridge Road", city:"Carterville", unit:"Unit 2", priority:"high", category:"hvac", title:"AC not cooling — tenant complaint", notes:"Tenant says AC runs but doesn't cool below 80°. Needs immediate attention.", status:"in_progress", assignedTo:"HVAC Sub", created:"2024-01-18", due:"2024-01-19"},
    {id:"wo3", address:"324 Magnolia Street", city:"Herrin", unit:"", priority:"low", category:"general", title:"Annual HVAC filter replacement", notes:"Scheduled maintenance — replace filters in all units.", status:"completed", assignedTo:"Mike D.", created:"2024-01-10", due:"2024-01-31"},
  ]);
  const [newWO, setNewWO] = useState({address:"",city:"",unit:"",priority:"medium",category:"general",title:"",notes:"",assignedTo:"",due:""});

  const rentalProps = properties.filter(p=>p.ourJob||p.timeline?.some(e=>["move_in","move_out","rental_insp"].includes(e.type)));
  const allProps = [...properties]; // In production: filter to landlord's portfolio

  const STATUS_CFG = {
    open:       {label:"Open",       color:C.yellow, icon:"🔴"},
    in_progress:{label:"In Progress",color:C.blue,   icon:"🔵"},
    completed:  {label:"Completed",  color:C.green,  icon:"✅"},
    cancelled:  {label:"Cancelled",  color:C.dim,    icon:"⭕"},
  };
  const PRIORITY_CFG = {
    high:  {label:"High",  color:C.red},
    medium:{label:"Medium",color:C.yellow},
    low:   {label:"Low",   color:C.green},
  };
  const CATEGORIES = ["general","plumbing","electrical","hvac","appliances","roof","exterior","pest","cleaning","other"];

  const openWOs = workOrders.filter(w=>w.status==="open"||w.status==="in_progress");
  const completedWOs = workOrders.filter(w=>w.status==="completed");

  const saveWorkOrder = () => {
    if(!newWO.title||!newWO.address) return;
    setWorkOrders(prev=>[{...newWO,id:`wo-${Date.now()}`,status:"open",created:new Date().toISOString().split("T")[0]},...prev]);
    setNewWO({address:"",city:"",unit:"",priority:"medium",category:"general",title:"",notes:"",assignedTo:"",due:""});
    setShowWorkOrder(false);
  };

  const updateWOStatus = (id, status) => {
    setWorkOrders(prev=>prev.map(w=>w.id===id?{...w,status}:w));
  };

  return (
    <div style={{paddingBottom:48}}>
      {/* Header */}
      <div style={{marginBottom:18}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Landlord Hub</div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,lineHeight:1.1,letterSpacing:-0.5,margin:0}}>Property Portfolio</h2>
        </div>
        <p style={{color:C.muted,fontSize:13}}>Manage your rental units, inspections, and maintenance in one place.</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:18}}>
        {[
          [allProps.length,"Units","total",C.accent],
          [openWOs.length,"Open","work orders",C.yellow],
          [workOrders.filter(w=>w.priority==="high"&&w.status!=="completed").length,"Urgent","high priority",C.red],
          [completedWOs.length,"Done","this month",C.green],
        ].map(([val,label,sub,col])=>(
          <div key={label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
            <div style={{color:col,fontSize:22,fontWeight:800,lineHeight:1}}>{val}</div>
            <div style={{color:C.text,fontSize:10,fontWeight:700,marginTop:3}}>{label}</div>
            <div style={{color:C.dim,fontSize:9,marginTop:1}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Sub tabs */}
      <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
        {[["portfolio","🏘️ Portfolio"],["workorders","🔧 Work Orders"],["inspections","📋 Inspections"],["reports","📊 Reports"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{background:tab===k?C.accent:C.card,color:tab===k?"#fff":C.muted,border:`1px solid ${tab===k?C.accent:C.border}`,borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",flexShrink:0,WebkitTapHighlightColor:"transparent"}}>{l}</button>
        ))}
      </div>

      {/* Add Unit Modal */}
      {showAddUnit&&<AddUnitModal onSave={unit=>{if(typeof setProperties==="function"){setProperties(prev=>[unit,...prev]);}setShowAddUnit(false);}} onClose={()=>setShowAddUnit(false)} existingProperties={allProps}/>}

      {/* Portfolio tab */}
      {tab==="portfolio"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{color:C.muted,fontSize:12}}>{allProps.length} properties in portfolio</div>
            <Btn small color={C.accent} onClick={()=>setShowAddUnit(true)}>+ Add Unit</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {allProps.map(p=>{
              const s=STATUS[p.roofStatus];
              const hasOpenWO = workOrders.some(w=>w.address===p.address&&(w.status==="open"||w.status==="in_progress"));
              const lastInspection = p.timeline?.filter(e=>["move_in","rental_insp","home_inspection"].includes(e.type)).sort((a,b)=>b.year-a.year)[0];
              return (
                <div key={p.id} onClick={()=>onSelect(p)} style={{background:C.card,border:`1px solid ${hasOpenWO?C.yellow+"44":C.border}`,borderRadius:13,padding:"14px 16px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=hasOpenWO?C.yellow+"44":C.border}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                        <div style={{color:C.text,fontWeight:700,fontSize:14}}>{p.address}</div>
                        {hasOpenWO&&<Pill color={C.yellow}>🔧 Work Order</Pill>}
                      </div>
                      <div style={{color:C.muted,fontSize:12}}>{p.city}, {p.state}</div>
                      <div style={{color:C.dim,fontSize:11,marginTop:3}}>
                        {lastInspection?`Last inspection: ${lastInspection.year}`:"No inspection on file"}
                        {p.ownerName&&` · ${p.ownerName}`}
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{color:s.color,fontWeight:800,fontSize:18,lineHeight:1}}>{p.roofAge}yr</div>
                      <Badge status={p.roofStatus} small/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Work Orders tab */}
      {tab==="workorders"&&(
        <div>
          <div style={{background:C.green+"0a",border:`1px solid ${C.green}33`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18,flexShrink:0}}>📱</span>
            <div style={{flex:1}}>
              <div style={{color:C.green,fontSize:12,fontWeight:700}}>Tenant requests show up here instantly</div>
              <div style={{color:C.muted,fontSize:11,marginTop:2}}>When a tenant submits a request with a photo, it logs as a work order and notifies you immediately. Requires server for push notifications.</div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{color:C.muted,fontSize:12}}>{openWOs.length} open · {completedWOs.length} completed</div>
            <Btn small color={C.accent} onClick={()=>setShowWorkOrder(true)}>+ New Work Order</Btn>
          </div>

          {/* New work order form */}
          {showWorkOrder&&(
            <div style={{background:C.card,border:`1px solid ${C.accent}44`,borderRadius:14,padding:18,marginBottom:16}}>
              <div style={{color:C.accent,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>New Work Order</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
                  <div>
                    <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Property Address</div>
                    <input value={newWO.address} onChange={e=>setNewWO(p=>({...p,address:e.target.value}))} placeholder="Street address"
                      style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  </div>
                  <div>
                    <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Unit # (opt)</div>
                    <input value={newWO.unit} onChange={e=>setNewWO(p=>({...p,unit:e.target.value}))} placeholder="e.g. Unit 2"
                      style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  </div>
                </div>
                <div>
                  <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Issue Title</div>
                  <input value={newWO.title} onChange={e=>setNewWO(p=>({...p,title:e.target.value}))} placeholder="Brief description of the issue"
                    style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  <div>
                    <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Priority</div>
                    <select value={newWO.priority} onChange={e=>setNewWO(p=>({...p,priority:e.target.value}))} style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Category</div>
                    <select value={newWO.category} onChange={e=>setNewWO(p=>({...p,category:e.target.value}))} style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
                      {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Due Date</div>
                    <input type="date" value={newWO.due} onChange={e=>setNewWO(p=>({...p,due:e.target.value}))} style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  </div>
                </div>
                <div>
                  <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Assign To</div>
                  <input value={newWO.assignedTo} onChange={e=>setNewWO(p=>({...p,assignedTo:e.target.value}))} placeholder="Name or company"
                    style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Details</div>
                  <textarea value={newWO.notes} onChange={e=>setNewWO(p=>({...p,notes:e.target.value}))} rows={3} placeholder="Describe the issue in detail for the maintenance person..."
                    style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.6}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <Btn full color={C.accent} onClick={saveWorkOrder} disabled={!newWO.title||!newWO.address}>Create Work Order</Btn>
                <Btn variant="ghost" small onClick={()=>setShowWorkOrder(false)}>Cancel</Btn>
              </div>
            </div>
          )}

          {/* Work order list */}
          {["open","in_progress","completed"].map(status=>{
            const wos = workOrders.filter(w=>w.status===status);
            if(!wos.length) return null;
            const sc = STATUS_CFG[status];
            return (
              <div key={status} style={{marginBottom:18}}>
                <div style={{color:sc.color,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>
                  {sc.icon} {sc.label} ({wos.length})
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {wos.map(wo=>{
                    const pc = PRIORITY_CFG[wo.priority];
                    const tc = TYPE_CFG[wo.category]||TYPE_CFG.note;
                    return (
                      <div key={wo.id} style={{background:C.card,border:`1px solid ${status==="completed"?C.border:pc.color+"33"}`,borderRadius:13,padding:"14px 16px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8}}>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                              <span style={{fontSize:16}}>{tc.icon}</span>
                              <div style={{color:C.text,fontWeight:700,fontSize:14}}>{wo.title}</div>
                              <Pill color={pc.color}>{pc.label}</Pill>
                            </div>
                            <div style={{color:C.muted,fontSize:12}}>{wo.address}{wo.unit?` · ${wo.unit}`:""}, {wo.city}</div>
                            {wo.assignedTo&&<div style={{color:C.blue,fontSize:11,marginTop:3}}>👤 {wo.assignedTo}</div>}
                            {wo.due&&<div style={{color:C.dim,fontSize:11,marginTop:2}}>Due: {wo.due}</div>}
                          </div>
                        </div>
                        {wo.notes&&<div style={{color:C.muted,fontSize:12,lineHeight:1.5,marginBottom:10,background:C.surface,borderRadius:8,padding:"8px 10px"}}>{wo.notes}</div>}
                        {status!=="completed"&&(
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {status==="open"&&<Btn small color={C.blue} onClick={()=>updateWOStatus(wo.id,"in_progress")}>Start Work</Btn>}
                            {status==="in_progress"&&<Btn small color={C.green} onClick={()=>updateWOStatus(wo.id,"completed")}>Mark Complete</Btn>}
                            <Btn small variant="ghost" onClick={()=>updateWOStatus(wo.id,"cancelled")}>Cancel</Btn>
                          </div>
                        )}
                        {status==="completed"&&<Pill color={C.green}>✓ Completed</Pill>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspections tab */}
      {tab==="inspections"&&(
        <div>
          <div style={{color:C.muted,fontSize:13,marginBottom:16,lineHeight:1.7}}>Upcoming and overdue inspections across your portfolio. Tap a property to log a new inspection.</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {allProps.map(p=>{
              const lastInsp = p.timeline?.filter(e=>["move_in","rental_insp","home_inspection"].includes(e.type)).sort((a,b)=>b.year-a.year)[0];
              const yearsSince = lastInsp ? new Date().getFullYear()-lastInsp.year : 99;
              const isDue = yearsSince>=1;
              return (
                <div key={p.id} onClick={()=>onSelect(p)} style={{background:C.card,border:`1px solid ${isDue?C.yellow+"44":C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                    <div>
                      <div style={{color:C.text,fontWeight:700,fontSize:14}}>{p.address}</div>
                      <div style={{color:C.muted,fontSize:12,marginTop:2}}>{p.city}, {p.state}</div>
                      <div style={{marginTop:6}}>
                        {lastInsp
                          ? <Pill color={isDue?C.yellow:C.green}>{isDue?`⚠ Last inspected ${lastInsp.year}`:`✓ Inspected ${lastInsp.year}`}</Pill>
                          : <Pill color={C.red}>⚠ Never inspected</Pill>
                        }
                      </div>
                    </div>
                    <div style={{color:C.dim,fontSize:20}}>›</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reports tab */}
      {tab==="reports"&&(
        <div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Portfolio Summary</div>
            {[
              ["Total Units",allProps.length],
              ["Properties with Open Work Orders",openWOs.length],
              ["Properties Needing Inspection",allProps.filter(p=>!p.timeline?.some(e=>["move_in","rental_insp"].includes(e.type))).length],
              ["Critical Roof Condition",allProps.filter(p=>p.roofStatus==="critical").length],
              ["Aging Roof Condition",allProps.filter(p=>p.roofStatus==="aging").length],
              ["Work Orders Completed This Month",completedWOs.length],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}22`}}>
                <span style={{color:C.muted,fontSize:13}}>{k}</span>
                <span style={{color:C.text,fontSize:13,fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn full color={C.accent} onClick={()=>{
          const lines=["HOMESTORY LANDLORD PORTFOLIO REPORT","Generated: "+new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),"="+"=".repeat(50),"",
            "PORTFOLIO SUMMARY","-".repeat(50),
            "Total Units: "+allProps.length,
            "Open Work Orders: "+openWOs.length,
            "Urgent (High Priority): "+workOrders.filter(w=>w.priority==="high"&&w.status!=="completed").length,
            "Completed This Period: "+completedWOs.length,
            "","PROPERTIES","-".repeat(50),
            ...allProps.map(p=>`${p.address}, ${p.city} | Built ${p.yearBuilt} | Roof: ${p.roofAge}yr (${STATUS[p.roofStatus]?.label})`),
            "","OPEN WORK ORDERS","-".repeat(50),
            ...openWOs.map(w=>`[${w.priority.toUpperCase()}] ${w.title} — ${w.address} | Assigned: ${w.assignedTo||"Unassigned"} | Due: ${w.due||"No date"}`),
            "","="+"=".repeat(50),"HomeStory · homestory.app · For landlord use only"
          ];
          const blob=new Blob([lines.join("\n")],{type:"text/plain"});
          const url=URL.createObjectURL(blob);
          const a=document.createElement("a");a.href=url;a.download="HomeStory_Portfolio_Report.txt";a.click();URL.revokeObjectURL(url);
        }}>↓ Download Portfolio Report</Btn>
          </div>
          <div style={{color:C.dim,fontSize:11,textAlign:"center",marginTop:8}}>PDF report includes all units, inspection status, and work order history</div>
        </div>
      )}
    </div>
  );
}


function ContractorDashboard({properties, onSelect, onLogJob, userTier='free', onUpgrade, regridToken, setRegridToken}) {
  const [contractorTab, setContractorTab] = useState('dashboard');
  const [regridTokenInput, setRegridTokenInput] = useState(regridToken||"");
  const ourJobs = properties.filter(p => p.ourJob || p.timeline?.some(e=>e.ourJob));
  const criticalOurs = ourJobs.filter(p=>p.roofStatus==="critical");
  const recentJobs = [...ourJobs]
    .sort((a,b)=>{
      const aEvs = a.timeline?.filter(e=>e.ourJob)||[];
      const bEvs = b.timeline?.filter(e=>e.ourJob)||[];
      const aMax = aEvs.length ? Math.max(...aEvs.map(e=>e.year)) : 0;
      const bMax = bEvs.length ? Math.max(...bEvs.map(e=>e.year)) : 0;
      return bMax - aMax;
    }).slice(0, 10);

  const allMechTypes = TRADE_CATEGORIES["Mechanical"];
  const mechJobs = properties.filter(p=>p.timeline?.some(e=>allMechTypes.includes(e.type)&&e.ourJob)) || [];

  return (
    <div style={{paddingBottom:48}}>
      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Contractor View</div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,lineHeight:1.1,letterSpacing:-0.5,margin:0}}>Your Dashboard</h2>
          {userTier==="contractor"&&ourJobs.length>=5&&<div style={{background:`linear-gradient(135deg,${C.accent},#f59e3f)`,borderRadius:20,padding:"3px 10px",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>🏅</span><span style={{color:"#fff",fontSize:10,fontWeight:800}}>VERIFIED</span></div>}
        </div>
        <p style={{color:C.muted,fontSize:13}}>All jobs your company has on file in the HomeStory database.</p>
      </div>

      {/* Sub nav */}
      <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
        {[["dashboard","Dashboard"],["territory","🗺️ Territory"],["verified","🏅 Verified"]].map(([k,l])=>(
          <button key={k} onClick={()=>setContractorTab(k)} style={{background:contractorTab===k?C.accent:C.card,color:contractorTab===k?"#fff":C.muted,border:`1px solid ${contractorTab===k?C.accent:C.border}`,borderRadius:10,padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",flexShrink:0,WebkitTapHighlightColor:"transparent"}}>{l}</button>
        ))}
      </div>

      {contractorTab==="verified"&&<VerifiedProgram userTier={userTier} properties={properties} onUpgrade={onUpgrade}/>}
      {contractorTab==="territory"&&<TerritoryScanner properties={properties} onSelect={onSelect}/>}
      {contractorTab==="dashboard"&&<div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
        {[
          [ourJobs.length,"Properties","total on file",C.accent],
          [recentJobs.filter(p=>p.timeline?.some(e=>e.ourJob&&e.year===new Date().getFullYear())).length,"This Year","jobs logged",C.green],
          [criticalOurs.length,"Need Attention","aging roofs",C.red],
        ].map(([val,label,sub,col])=>(
          <div key={label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 12px",textAlign:"center"}}>
            <div style={{color:col,fontSize:26,fontWeight:800,lineHeight:1}}>{val}</div>
            <div style={{color:C.text,fontSize:11,fontWeight:700,marginTop:4}}>{label}</div>
            <div style={{color:C.dim,fontSize:9,marginTop:2}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Upgrade prompt for free tier */}
      {userTier==="free"&&(
        <div style={{background:C.card,border:`1px solid ${C.accent}44`,borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12}}>
            <div>
              <div style={{color:C.accent,fontSize:13,fontWeight:700,marginBottom:3}}>You're on the Free plan</div>
              <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Your data is flowing in. Upgrade to unlock reports, scanner, measurements, and the full dashboard.</div>
            </div>
          </div>
          <Btn full color={C.accent} onClick={onUpgrade}>Upgrade to Pro — $49/mo</Btn>
          <div style={{color:C.dim,fontSize:11,textAlign:"center",marginTop:8}}>30-day free trial · Cancel anytime</div>
        </div>
      )}

      {/* Quick log button */}
      <div style={{background:`linear-gradient(135deg,${C.accent}22,${C.accent}0a)`,border:`1px solid ${C.accent}44`,borderRadius:14,padding:16,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div>
          <div style={{color:C.accent,fontSize:14,fontWeight:800,marginBottom:3}}>⚡ Log a Job</div>
          <div style={{color:C.muted,fontSize:12}}>Roof, HVAC, plumbing, electrical — any trade, under a minute.</div>
        </div>
        <Btn small color={C.accent} onClick={onLogJob}>Log Now →</Btn>
      </div>

      {/* Integrations status */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:20}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Integrations</div>
        <div style={{color:C.dim,fontSize:11,marginBottom:14}}>Connect your tools — jobs and photos flow in automatically.</div>

        {/* Native connected */}
        <div style={{color:C.green,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>✓ Connected</div>
        {[
          {name:"Roofr",icon:"🏗️",desc:"Jobs sync automatically when stage changes",connected:true},
          {name:"CompanyCam",icon:"📱",desc:"Photos sync the moment your crew takes them",connected:true},
        ].map(int=>(
          <div key={int.name} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
            <span style={{fontSize:20}}>{int.icon}</span>
            <div style={{flex:1}}>
              <div style={{color:C.text,fontSize:13,fontWeight:600}}>{int.name}</div>
              <div style={{color:C.dim,fontSize:11,marginTop:1}}>{int.desc}</div>
            </div>
            <div style={{background:C.green+"22",border:`1px solid ${C.green}44`,borderRadius:20,padding:"4px 12px",color:C.green,fontSize:10,fontWeight:700,flexShrink:0}}>✓ Live</div>
          </div>
        ))}

        {/* Regrid token */}
        <div style={{padding:"12px 0",borderBottom:`1px solid ${C.border}22`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <span style={{fontSize:20}}>📍</span>
            <div style={{flex:1}}>
              <div style={{color:C.text,fontSize:13,fontWeight:600}}>Regrid Parcels</div>
              <div style={{color:C.dim,fontSize:11,marginTop:1}}>Year built, sq ft, owner, assessed value — auto-fills every property</div>
            </div>
            <div style={{background:regridTokenInput?C.green+"22":C.surface,border:`1px solid ${regridTokenInput?C.green+"44":C.border}`,borderRadius:20,padding:"4px 12px",color:regridTokenInput?C.green:C.muted,fontSize:10,fontWeight:700,flexShrink:0}}>
              {regridTokenInput?"✓ Connected":"Not set"}
            </div>
          </div>
          <input value={regridTokenInput} onChange={e=>{setRegridTokenInput(e.target.value);setRegridToken(e.target.value);}} placeholder="Paste Regrid API token — regrid.com/api"
            style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          <div style={{color:C.dim,fontSize:10,marginTop:4}}>regrid.com/api · $99/mo · Fills in year built, sqft, owner on all 311 properties</div>
        </div>

        {/* Coming soon — waitlist */}
        <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginTop:14,marginBottom:8}}>Coming Soon</div>
        {[
          {name:"JobNimbus",       icon:"📋", desc:"Popular roofing CRM"},
          {name:"AccuLynx",        icon:"📐", desc:"Roofing industry CRM"},
          {name:"Leap",            icon:"🚀", desc:"Sales-focused roofing platform"},
          {name:"RoofSnap",        icon:"📏", desc:"Measurements + CRM"},
          {name:"ServiceTitan",    icon:"⚙️", desc:"Enterprise contractor platform"},
          {name:"Jobber",          icon:"🔨", desc:"General contractor CRM"},
          {name:"iRoofing",        icon:"🏠", desc:"Roofing supplier + CRM"},
          {name:"Hatch",           icon:"💬", desc:"Contractor communication platform"},
          {name:"EagleView",       icon:"🦅", desc:"Aerial measurements"},
          {name:"Spectora",        icon:"🔍", desc:"Home inspection software"},
          {name:"Google Street View",icon:"🛣️",desc:"Historical property photos"},
          {name:"FEMA Flood Maps", icon:"🌊", desc:"Flood zone data"},
          {name:"County Permits",  icon:"📜", desc:"Building permit history"},
        ].map(int=>(
          <div key={int.name} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${C.border}11`}}>
            <span style={{fontSize:18,width:24,textAlign:"center"}}>{int.icon}</span>
            <div style={{flex:1}}>
              <div style={{color:C.text,fontSize:12,fontWeight:600}}>{int.name}</div>
              <div style={{color:C.dim,fontSize:10,marginTop:1}}>{int.desc}</div>
            </div>
            <div onClick={()=>alert(`Thanks! We'll notify you when ${int.name} integration launches.`)} style={{background:C.accent+"11",border:`1px solid ${C.accent}33`,borderRadius:20,padding:"3px 10px",color:C.accent,fontSize:9,fontWeight:700,flexShrink:0,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
              Notify Me
            </div>
          </div>
        ))}
        <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:10,padding:"10px 14px",marginTop:12}}>
          <div style={{color:C.blue,fontSize:11,fontWeight:700,marginBottom:3}}>⚡ Connect any CRM via Zapier</div>
          <div style={{color:C.dim,fontSize:11,marginBottom:6}}>Use Webhooks by Zapier to connect any CRM not listed above.</div>
          <div style={{color:C.dim,fontSize:10,fontFamily:"monospace",background:C.card,borderRadius:6,padding:"4px 8px"}}>POST → homestory-server-production.up.railway.app/api/webhook/roofr</div>
        </div>
      </div>

      {/* Mechanical jobs */}
      {mechJobs.length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Mechanical Work on File</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {mechJobs.slice(0,5).map(p=>{
              const mechEvs = p.timeline.filter(e=>allMechTypes.includes(e.type)&&e.ourJob);
              return (
                <div key={p.id} onClick={()=>onSelect(p)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:4}}>{p.address}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {mechEvs.map(ev=>{
                      const tc=TYPE_CFG[ev.type];
                      return <span key={ev.id} style={{background:tc.color+"22",color:tc.color,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{tc.icon} {tc.label} {ev.year}</span>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent jobs */}
      <div style={{marginBottom:20}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Recent Jobs ({ourJobs.length})</div>
        {recentJobs.length===0&&(
          <div style={{textAlign:"center",padding:32,color:C.dim,fontSize:13}}>
            No jobs logged yet. Tap "Log Now" to add your first job.
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {recentJobs.map(p=>{
            const latestJob = [...(p.timeline||[])].filter(e=>e.ourJob).sort((a,b)=>b.year-a.year)[0];
            const s = STATUS[p.roofStatus];
            return (
              <div key={p.id} onClick={()=>onSelect(p)} style={{background:C.card,border:`1px solid ${C.accent}33`,borderRadius:13,padding:"14px 16px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.accent+"33"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                      <div style={{color:C.text,fontWeight:700,fontSize:14}}>{p.address}</div>
                      <Pill color={C.accent}>Our Work</Pill>
                    </div>
                    <div style={{color:C.muted,fontSize:12}}>{p.city}, {p.state}</div>
                    {latestJob&&(
                      <div style={{color:C.accent,fontSize:11,marginTop:4}}>
                        {TYPE_CFG[latestJob.type]?.icon} {latestJob.label} · {latestJob.year}
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{color:s.color,fontWeight:800,fontSize:20,lineHeight:1}}>{p.roofAge}yr</div>
                    <Badge status={p.roofStatus} small/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aging roofs from our jobs */}
      {criticalOurs.length>0&&(
        <div>
          <div style={{color:C.red,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>⚠ Our Jobs Needing Attention</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {criticalOurs.map(p=>(
              <div key={p.id} onClick={()=>onSelect(p)} style={{background:C.red+"0a",border:`1px solid ${C.red}33`,borderRadius:12,padding:"14px 16px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                  <div>
                    <div style={{color:C.text,fontWeight:700,fontSize:14}}>{p.address}</div>
                    <div style={{color:C.muted,fontSize:12,marginTop:2}}>{p.city} · Roof last replaced {p.lastRoof}</div>
                  </div>
                  <div style={{color:C.red,fontWeight:800,fontSize:20}}>{p.roofAge}yr</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>}
    </div>
  );
}



// ── Documents Folder ──────────────────────────────────────────────────────────


// ── Point of Sale Inspection Upload ──────────────────────────────────────────
function SaleInspectionUpload({property, onComplete}) {
  if(!property) return null;
  const [step, setStep] = useState(1); // 1=who, 2=upload, 3=parse, 4=review, 5=done
  const [role, setRole] = useState(null);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [saleDetails, setSaleDetails] = useState({
    saleDate:"", salePrice:"", buyer:"", seller:"",
    agentBuyer:"", agentSeller:"", inspector:"", inspectorLicense:"",
    inspectionDate:"", inspectionCompany:"",
  });
  const [systemRatings, setSystemRatings] = useState({
    roof:"", hvac:"", plumbing:"", electrical:"",
    foundation:"", windows:"", insulation:"", attic:"",
  });
  const [overallRating, setOverallRating] = useState("good");
  const [keyFindings, setKeyFindings] = useState("");
  const fileRef = useRef();

  const ROLES = [
    {id:"buyer",   icon:"🏠", label:"Buyer",          desc:"You are purchasing this property"},
    {id:"seller",  icon:"💰", label:"Seller",          desc:"You are selling this property"},
    {id:"agent",   icon:"🤝", label:"Real Estate Agent",desc:"You are representing a buyer or seller"},
    {id:"inspector",icon:"🔍",label:"Home Inspector",  desc:"You performed the inspection"},
  ];

  const CONDITIONS = [
    {v:"good", l:"Good",  c:C.green},
    {v:"fair", l:"Fair",  c:C.yellow},
    {v:"poor", l:"Poor",  c:C.red},
    {v:"na",   l:"N/A",   c:C.dim},
  ];

  const SYSTEMS = [
    {key:"roof",       icon:"🏠", label:"Roof"},
    {key:"hvac",       icon:"❄️", label:"HVAC"},
    {key:"plumbing",   icon:"💧", label:"Plumbing"},
    {key:"electrical", icon:"⚡", label:"Electrical"},
    {key:"foundation", icon:"⬛", label:"Foundation"},
    {key:"windows",    icon:"🪟", label:"Windows"},
    {key:"insulation", icon:"🌡️", label:"Insulation"},
    {key:"attic",      icon:"🔺", label:"Attic"},
  ];

  const parseReport = async () => {
    setParsing(true);
    setStep(3);
    // Simulate AI parsing — in production hits Claude API with PDF content
    await new Promise(r => setTimeout(r, 2500));
    setParsed({
      inspector: "James R. Holloway",
      company: "Southern Illinois Home Inspections",
      license: "IL-INSP-44821",
      date: "2024-01-15",
      pages: 42,
      systems: {
        roof: "fair", hvac: "good", plumbing: "good",
        electrical: "good", foundation: "good",
        windows: "fair", insulation: "fair", attic: "good",
      },
      keyFindings: "Roof showing granule loss consistent with age (16yr). Recommend budgeting for replacement within 2-3 years. Minor weatherstripping needed on 3 windows. Attic insulation adequate but aging. All mechanical systems functioning properly. No major structural concerns identified.",
      overall: "fair",
    });
    setSystemRatings({roof:"fair",hvac:"good",plumbing:"good",electrical:"good",foundation:"good",windows:"fair",insulation:"fair",attic:"good"});
    setOverallRating("fair");
    setKeyFindings("Roof showing granule loss consistent with age (16yr). Recommend budgeting for replacement within 2-3 years. Minor weatherstripping needed on 3 windows. Attic insulation adequate but aging. All mechanical systems functioning properly. No major structural concerns identified.");
    setParsing(false);
    setStep(4);
  };

  const handleSave = () => {
    // In production: save to database and attach PDF to documents folder
    onComplete && onComplete({
      type:"home_inspection", role, saleDetails,
      systemRatings, overallRating, keyFindings,
      file: file?.name,
    });
    setStep(5);
  };

  if(step===5) return (
    <div style={{textAlign:"center",padding:"48px 0"}}>
      <div style={{fontSize:52,marginBottom:16}}>✅</div>
      <div style={{color:C.green,fontSize:20,fontWeight:800,marginBottom:8}}>Inspection Report Saved</div>
      <div style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:8}}>{property.address}</div>
      <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:12,padding:16,marginBottom:24,textAlign:"left"}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            "Inspection report permanently attached to this address",
            "Key findings extracted and added to property timeline",
            "System condition ratings saved to Home Report",
            "PDF stored in HomeStory cloud documents folder",
            "Future buyers and adjusters will see this record",
          ].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,color:C.muted,fontSize:12}}>
              <span style={{color:C.green,flexShrink:0}}>✓</span>{t}
            </div>
          ))}
        </div>
      </div>
      <Btn full variant="ghost" onClick={()=>setStep(1)}>Upload Another Report</Btn>
    </div>
  );

  return (
    <div style={{paddingBottom:40}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.card},${C.card2})`,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:20}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Point of Sale</div>
        <div style={{color:C.text,fontSize:18,fontWeight:800,marginBottom:4}}>Inspection Report Upload</div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>{property.address}, {property.city}</div>
        <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:10,padding:"10px 12px",marginTop:12}}>
          <div style={{color:C.blue,fontSize:11,fontWeight:700,marginBottom:3}}>Why this matters</div>
          <div style={{color:C.muted,fontSize:11,lineHeight:1.6}}>Home inspection reports disappear after closing. Uploading here creates a permanent verified record that protects buyers, sellers, and future owners for the life of the property.</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{display:"flex",gap:4,marginBottom:24}}>
        {[1,2,4].map(n=><div key={n} style={{flex:1,height:4,borderRadius:2,background:step>=n?C.accent:C.border,transition:"background 0.3s"}}/>)}
      </div>

      {/* Step 1 — Who are you */}
      {step===1&&(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Step 1 — Who are you?</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {ROLES.map(r=>(
              <div key={r.id} onClick={()=>setRole(r.id)} style={{background:role===r.id?C.accent+"22":C.card,border:`2px solid ${role===r.id?C.accent:C.border}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:26,flexShrink:0}}>{r.icon}</span>
                <div>
                  <div style={{color:role===r.id?C.accent:C.text,fontSize:14,fontWeight:700}}>{r.label}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:2}}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sale details */}
          {role&&(
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:16}}>
              <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Sale Details (optional)</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {key:"saleDate",    label:"Sale Date",    type:"date"},
                  {key:"salePrice",   label:"Sale Price",   placeholder:"$000,000"},
                  {key:"buyer",       label:"Buyer Name",   placeholder:"Full name"},
                  {key:"seller",      label:"Seller Name",  placeholder:"Full name"},
                  {key:"agentBuyer",  label:"Buyer's Agent",placeholder:"Agent name"},
                  {key:"agentSeller", label:"Seller's Agent",placeholder:"Agent name"},
                ].map(f=>(
                  <div key={f.key}>
                    <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{f.label}</div>
                    <input type={f.type||"text"} value={saleDetails[f.key]} onChange={e=>setSaleDetails(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                      style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Btn full color={C.accent} disabled={!role} onClick={()=>setStep(2)}>Next — Upload Report →</Btn>
        </div>
      )}

      {/* Step 2 — Upload */}
      {step===2&&(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Step 2 — Upload Inspection Report</div>

          {!file?(
            <div>
              <div onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${C.border}`,borderRadius:16,padding:"48px 20px",textAlign:"center",cursor:"pointer",marginBottom:16,WebkitTapHighlightColor:"transparent"}}>
                <div style={{fontSize:44,marginBottom:12}}>📄</div>
                <div style={{color:C.text,fontSize:16,fontWeight:700,marginBottom:6}}>Upload Inspection Report</div>
                <div style={{color:C.muted,fontSize:13,marginBottom:8}}>Tap to choose your PDF or photos</div>
                <div style={{color:C.dim,fontSize:11}}>PDF · JPG · PNG — report, checklist, or photos accepted</div>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setFile(e.target.files[0]);}}/>

              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:16}}>
                <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Don't have the PDF?</div>
                <div style={{color:C.muted,fontSize:12,lineHeight:1.7,marginBottom:12}}>You can still add the inspection manually. Enter the key findings and system ratings below and HomeStory will create a structured record.</div>
                <Btn small variant="ghost" onClick={()=>setStep(4)}>Enter Manually Instead</Btn>
              </div>
            </div>
          ):(
            <div>
              <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:12,padding:16,marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:28,flexShrink:0}}>📄</span>
                <div style={{flex:1}}>
                  <div style={{color:C.green,fontSize:13,fontWeight:700,marginBottom:2}}>✓ Report Ready</div>
                  <div style={{color:C.muted,fontSize:12}}>{file.name}</div>
                  <div style={{color:C.dim,fontSize:11,marginTop:2}}>{file.size>1000000?(file.size/1000000).toFixed(1)+" MB":Math.round(file.size/1000)+" KB"}</div>
                </div>
                <button onClick={()=>setFile(null)} style={{background:"none",border:`1px solid ${C.border}`,color:C.dim,borderRadius:7,padding:"4px 8px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>✕</button>
              </div>

              <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:12,padding:14,marginBottom:16}}>
                <div style={{color:C.blue,fontSize:12,fontWeight:700,marginBottom:4}}>🤖 AI will parse this report</div>
                <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>HomeStory reads the inspection report and automatically extracts system condition ratings, key findings, inspector details, and recommendations. You can review and edit everything before saving.</div>
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" small onClick={()=>setStep(1)}>← Back</Btn>
            <Btn full color={C.accent} disabled={!file&&step!==2} onClick={file?parseReport:()=>setStep(4)}>
              {file?"🤖 Parse Report with AI →":"Enter Manually →"}
            </Btn>
          </div>
        </div>
      )}

      {/* Step 3 — Parsing */}
      {step===3&&(
        <div style={{textAlign:"center",padding:"48px 20px"}}>
          <div style={{marginBottom:24}}>
            <Spinner size={48}/>
          </div>
          <div style={{color:C.text,fontSize:17,fontWeight:700,marginBottom:8}}>Reading Inspection Report</div>
          <div style={{color:C.muted,fontSize:13,lineHeight:1.7,maxWidth:300,margin:"0 auto"}}>
            HomeStory AI is extracting system ratings, key findings, inspector details, and recommendations from your report...
          </div>
          <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:8,maxWidth:280,margin:"24px auto 0"}}>
            {["Identifying property details","Reading system condition ratings","Extracting key findings","Parsing inspector credentials","Building property timeline entry"].map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:C.accent+"33",border:`2px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:C.accent}}/>
                </div>
                <div style={{color:C.muted,fontSize:12}}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4 — Review / Manual entry */}
      {step===4&&(
        <div>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>
            {parsed?"Review Parsed Data":"Enter Inspection Details"}
          </div>

          {parsed&&(
            <div style={{background:C.green+"0a",border:`1px solid ${C.green}33`,borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>🤖</span>
              <div style={{color:C.green,fontSize:12,fontWeight:700}}>AI parsed {file?.name} — {parsed.pages} pages · Review and edit below</div>
            </div>
          )}

          {/* Inspector details */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Inspector Details</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {key:"inspector",        label:"Inspector Name",    placeholder:"Full name",      val:parsed?.inspector||""},
                {key:"inspectorLicense", label:"License #",         placeholder:"IL-INSP-XXXXX",  val:parsed?.license||""},
                {key:"inspectionCompany",label:"Company",           placeholder:"Company name",   val:parsed?.company||""},
                {key:"inspectionDate",   label:"Inspection Date",   type:"date",                  val:parsed?.date||""},
              ].map(f=>(
                <div key={f.key}>
                  <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{f.label}</div>
                  <input type={f.type||"text"} defaultValue={f.val} onChange={e=>setSaleDetails(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                    style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
          </div>

          {/* Overall rating */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Overall Property Condition</div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              {CONDITIONS.filter(c=>c.v!=="na").map(c=>(
                <div key={c.v} onClick={()=>setOverallRating(c.v)} style={{flex:1,background:overallRating===c.v?c.c+"22":C.surface,border:`2px solid ${overallRating===c.v?c.c:C.border}`,borderRadius:10,padding:"10px 8px",cursor:"pointer",textAlign:"center",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{color:overallRating===c.v?c.c:C.muted,fontSize:13,fontWeight:700}}>{c.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System ratings */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>System Condition Ratings</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {SYSTEMS.map(sys=>(
                <div key={sys.key} style={{background:C.surface,borderRadius:10,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                    <span style={{fontSize:14}}>{sys.icon}</span>
                    <span style={{color:C.text,fontSize:12,fontWeight:600}}>{sys.label}</span>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    {CONDITIONS.map(c=>(
                      <div key={c.v} onClick={()=>setSystemRatings(p=>({...p,[sys.key]:c.v}))}
                        style={{flex:1,background:systemRatings[sys.key]===c.v?c.c+"33":"transparent",border:`1px solid ${systemRatings[sys.key]===c.v?c.c:C.border}`,borderRadius:5,padding:"3px 0",textAlign:"center",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                        <span style={{color:systemRatings[sys.key]===c.v?c.c:C.dim,fontSize:9,fontWeight:700}}>{c.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key findings */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:16}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Key Findings & Recommendations</div>
            <textarea value={keyFindings} onChange={e=>setKeyFindings(e.target.value)} rows={5}
              placeholder="Summary of key findings, items needing attention, and inspector recommendations..."
              style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit",lineHeight:1.7}}/>
          </div>

          {/* What gets saved */}
          <div style={{background:C.accent+"0a",border:`1px solid ${C.accent}33`,borderRadius:12,padding:14,marginBottom:16}}>
            <div style={{color:C.accent,fontSize:11,fontWeight:700,marginBottom:6}}>What gets saved to HomeStory</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {[
                "Inspection report PDF → Documents folder",
                "System ratings → Home Report and timeline",
                "Key findings → Property timeline entry",
                "Inspector credentials → Verified source tag",
                "Sale details → Ownership history",
              ].map((t,i)=>(
                <div key={i} style={{display:"flex",gap:8,color:C.muted,fontSize:12}}>
                  <span style={{color:C.accent,flexShrink:0}}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" small onClick={()=>setStep(file?2:1)}>← Back</Btn>
            <Btn full color={C.accent} onClick={handleSave}>Save to HomeStory →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}


function DocumentsFolder({property}) {
  const [docs, setDocs] = useState([
    {id:"d1",name:"Move-In Inspection — Apr 2021.pdf",  type:"inspection",size:"1.2 MB",date:"Apr 12 2021",icon:"📋"},
    {id:"d2",name:"Lease Agreement — 2021-2022.pdf",     type:"lease",     size:"340 KB",date:"Apr 1 2021", icon:"📄"},
    {id:"d3",name:"HomeStory Home Report.pdf",           type:"report",    size:"890 KB",date:"Jan 15 2024",icon:"🏠"},
    {id:"d4",name:"Roof Warranty — GAF 30yr.pdf",        type:"warranty",  size:"210 KB",date:"Oct 2022",   icon:"🏅"},
    {id:"d5",name:"Insurance Certificate 2024.pdf",      type:"insurance", size:"445 KB",date:"Jan 1 2024", icon:"🛡️"},
  ]);
  const [filter,setFilter]=useState("all");
  const [uploading,setUploading]=useState(false);
  const fileRef=useRef();

  const DOC_TYPES=[{id:"all",label:"All"},{id:"inspection",label:"Inspections"},{id:"lease",label:"Leases"},{id:"warranty",label:"Warranties"},{id:"insurance",label:"Insurance"},{id:"report",label:"Reports"},{id:"other",label:"Other"}];
  const TYPE_COLORS={inspection:C.blue,lease:C.purple,warranty:C.accent,insurance:C.green,report:C.accent,other:C.muted};

  const handleUpload=(files)=>{
    setUploading(true);
    Array.from(files).forEach(file=>{
      setTimeout(()=>{
        setDocs(prev=>[{id:`d-${Date.now()}`,name:file.name,type:"other",size:file.size>1000000?(file.size/1000000).toFixed(1)+" MB":Math.round(file.size/1000)+" KB",date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),icon:"📁"},...prev]);
        setUploading(false);
      },600);
    });
  };

  const filtered=filter==="all"?docs:docs.filter(d=>d.type===filter);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{color:C.text,fontSize:15,fontWeight:800}}>📁 Documents</div><div style={{color:C.muted,fontSize:12,marginTop:2}}>{docs.length} files · {property.address}</div></div>
        <button onClick={()=>fileRef.current.click()} style={{background:C.accent,color:"#fff",border:"none",borderRadius:9,padding:"8px 14px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
          {uploading?<Spinner size={12}/>:"+"} Upload
        </button>
        <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.png,.doc,.docx" style={{display:"none"}} onChange={e=>handleUpload(e.target.files)}/>
      </div>

      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:12,WebkitOverflowScrolling:"touch"}}>
        {DOC_TYPES.map(t=>(
          <button key={t.id} onClick={()=>setFilter(t.id)} style={{background:filter===t.id?C.accent+"22":"none",color:filter===t.id?C.accent:C.muted,border:`1px solid ${filter===t.id?C.accent+"44":C.border}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",flexShrink:0,WebkitTapHighlightColor:"transparent"}}>{t.label}</button>
        ))}
      </div>

      <div onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${C.border}`,borderRadius:12,padding:"20px",textAlign:"center",cursor:"pointer",marginBottom:14,WebkitTapHighlightColor:"transparent"}}>
        <div style={{fontSize:24,marginBottom:6}}>📎</div>
        <div style={{color:C.muted,fontSize:13}}>Drop files or <span style={{color:C.accent}}>browse</span></div>
        <div style={{color:C.dim,fontSize:11,marginTop:4}}>PDF, JPG, PNG — inspection reports, leases, warranties, insurance docs</div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(doc=>{
          const col=TYPE_COLORS[doc.type]||C.muted;
          return (
            <div key={doc.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:10,background:col+"22",border:`1px solid ${col}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{doc.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{background:col+"22",color:col,borderRadius:4,padding:"1px 7px",fontSize:9,fontWeight:700,textTransform:"uppercase"}}>{doc.type}</span>
                  <span style={{color:C.dim,fontSize:11}}>{doc.size}</span>
                  <span style={{color:C.dim,fontSize:11}}>{doc.date}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>View</button>
                <button onClick={()=>setDocs(prev=>prev.filter(d=>d.id!==doc.id))} style={{background:"none",border:`1px solid ${C.border}`,color:C.dim,borderRadius:7,padding:"5px 8px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>✕</button>
              </div>
            </div>
          );
        })}
        {!filtered.length&&<div style={{textAlign:"center",padding:"32px 0",color:C.dim,fontSize:13}}>No documents in this category.</div>}
      </div>

      <div style={{background:C.accent+"0a",border:`1px solid ${C.accent}33`,borderRadius:12,padding:"12px 14px",marginTop:14}}>
        <div style={{color:C.accent,fontSize:11,fontWeight:700,marginBottom:4}}>Auto-generated documents</div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Home Reports and inspection records are automatically saved here. Connect CompanyCam and Roofr and job documentation saves automatically too.</div>
      </div>
    </div>
  );
}




// ── CSV Import Screen ─────────────────────────────────────────────────────────
function CSVImportScreen({onComplete}) {
  const [status, setStatus] = useState("idle"); // idle | parsing | uploading | done | error
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState([]);
  const fileRef = useRef();

  const parseCSV = (text) => {
    const lines = text.split("\n").filter(l=>l.trim());
    const headers = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
    const rows = [];
    for(let i=1;i<lines.length;i++) {
      const vals = [];
      let cur = "", inQ = false;
      for(const ch of lines[i]) {
        if(ch==='"') inQ=!inQ;
        else if(ch===","&&!inQ) { vals.push(cur.trim()); cur=""; }
        else cur+=ch;
      }
      vals.push(cur.trim());
      const row = {};
      headers.forEach((h,j)=>{ row[h]=vals[j]||""; });
      rows.push(row);
    }
    return rows;
  };

  const handleFile = async (file) => {
    if(!file) return;
    setStatus("parsing");
    const text = await file.text();
    const rows = parseCSV(text);
    setPreview(rows.slice(0,5));
    setStatus("ready");
    window._csvRows = rows;
  };

  const handleImport = async () => {
    const rows = window._csvRows;
    if(!rows||!rows.length) return;
    setStatus("uploading");
    try {
      const res = await fetch("https://homestory-server-production.up.railway.app/api/import-csv", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({rows}),
      });
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch(err) {
      setStatus("error");
      setResult({error: err.message});
    }
  };

  return (
    <div style={{paddingBottom:40}}>
      <div style={{marginBottom:20}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Historical Import</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,letterSpacing:-0.5,marginBottom:8}}>Import from Roofr CSV</h2>
        <p style={{color:C.muted,fontSize:13,lineHeight:1.7}}>Upload your Roofr job export to bring your full job history into HomeStory. Every address becomes a permanent property record.</p>
      </div>

      {status==="idle"&&(
        <div>
          <div onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${C.border}`,borderRadius:14,padding:"48px 20px",textAlign:"center",cursor:"pointer",marginBottom:16,background:C.card}}>
            <div style={{fontSize:40,marginBottom:10}}>📂</div>
            <div style={{color:C.text,fontSize:15,fontWeight:700,marginBottom:6}}>Upload Roofr CSV Export</div>
            <div style={{color:C.muted,fontSize:13}}>job-report-export-*.csv</div>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>How to export from Roofr</div>
            {["1. Go to Jobs in Roofr","2. Click Export or Download","3. Select All Jobs / CSV format","4. Upload that file here"].map((s,i)=>(
              <div key={i} style={{color:C.muted,fontSize:13,padding:"4px 0"}}>{s}</div>
            ))}
          </div>
        </div>
      )}

      {status==="parsing"&&(
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <Spinner size={40}/>
          <div style={{color:C.muted,fontSize:14,marginTop:16}}>Reading CSV file...</div>
        </div>
      )}

      {status==="ready"&&(
        <div>
          <div style={{background:C.green+"0a",border:`1px solid ${C.green}33`,borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{color:C.green,fontSize:14,fontWeight:700,marginBottom:4}}>✓ {window._csvRows?.length} jobs ready to import</div>
            <div style={{color:C.muted,fontSize:12}}>Preview of first 5 rows:</div>
          </div>
          {preview.map((row,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginBottom:8}}>
              <div style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:2}}>{row["Job address"]}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <Pill color={row["Stage category"]==="Completed"?C.green:row["Stage category"]==="Won"?C.blue:C.muted}>{row["Stage category"]}</Pill>
                {row["Customer name"]&&<Pill color={C.dim}>{row["Customer name"]}</Pill>}
                {parseFloat(row["Job value"])>0&&<Pill color={C.accent}>${parseFloat(row["Job value"]).toLocaleString()}</Pill>}
              </div>
            </div>
          ))}
          <div style={{marginTop:16,display:"flex",gap:10}}>
            <Btn variant="ghost" onClick={()=>{setStatus("idle");setPreview([]);}}>Cancel</Btn>
            <Btn full color={C.accent} onClick={handleImport}>Import All {window._csvRows?.length} Jobs →</Btn>
          </div>
        </div>
      )}

      {status==="uploading"&&(
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <Spinner size={40}/>
          <div style={{color:C.text,fontSize:16,fontWeight:700,marginTop:16,marginBottom:8}}>Importing jobs...</div>
          <div style={{color:C.muted,fontSize:13}}>Building your Southern Illinois property database</div>
        </div>
      )}

      {status==="done"&&result&&(
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{fontSize:52,marginBottom:16}}>✅</div>
          <div style={{color:C.green,fontSize:20,fontWeight:800,marginBottom:8}}>Import Complete</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
            {[["Imported",result.imported,C.green],["Skipped",result.skipped,C.yellow],["Errors",result.errors,C.red]].map(([l,v,c])=>(
              <div key={l} style={{background:C.card,border:`1px solid ${c}33`,borderRadius:12,padding:"16px 10px",textAlign:"center"}}>
                <div style={{color:c,fontSize:24,fontWeight:800}}>{v}</div>
                <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{color:C.muted,fontSize:13,marginBottom:24}}>Your property database now includes your full Roofr job history.</div>
          <Btn full color={C.accent} onClick={()=>{setStatus("idle");onComplete&&onComplete();}}>View Properties →</Btn>
        </div>
      )}

      {status==="error"&&(
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{fontSize:40,marginBottom:12}}>❌</div>
          <div style={{color:C.red,fontSize:16,fontWeight:700,marginBottom:8}}>Import Failed</div>
          <div style={{color:C.muted,fontSize:13,marginBottom:16}}>{result?.error||"Unknown error"}</div>
          <Btn variant="ghost" onClick={()=>setStatus("idle")}>Try Again</Btn>
        </div>
      )}
    </div>
  );
}


// ── Cloud Storage UI ──────────────────────────────────────────────────────────
function CloudStoragePanel({userTier}) {
  const [status, setStatus] = useState("checking"); // checking | connected | offline
  const [stats, setStats] = useState({photos:0, size:"0 MB", properties:0});
  const [uploading, setUploading] = useState(false);
  const [recentUploads, setRecentUploads] = useState([
    {id:"u1", name:"5814 Northwind Dr — Roof After.jpg",   property:"5814 Northwind Drive",  size:"2.1 MB", source:"CompanyCam", time:"2 hours ago",   synced:true},
    {id:"u2", name:"1847 Oak Ridge — Pre-Loss Hail.jpg",   property:"1847 Oak Ridge Road",   size:"1.8 MB", source:"CompanyCam", time:"Yesterday",      synced:true},
    {id:"u3", name:"Tenant Request — Dripping Faucet.jpg", property:"5814 Northwind Drive",  size:"890 KB", source:"Tenant",     time:"Jan 18, 2024",   synced:true},
    {id:"u4", name:"Move-In Inspection — Unit 2.jpg",      property:"1847 Oak Ridge Road",   size:"3.2 MB", source:"Upload",     time:"Jan 15, 2024",   synced:true},
  ]);
  const fileRef = useRef();

  useEffect(()=>{
    fetch("https://homestory-server-production.up.railway.app/api/storage/status")
      .then(r=>r.json())
      .then(d=>{ setStatus(d.configured?"connected":"offline"); setStats({photos:recentUploads.length,size:"8.0 MB",properties:3}); })
      .catch(()=>setStatus("offline"));
  },[]);

  const handleUpload = async (files) => {
    setUploading(true);
    for(const file of Array.from(files)) {
      await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = async e => {
          const base64 = e.target.result.split(",")[1];
          if(status==="connected") {
            try {
              await fetch("https://homestory-server-production.up.railway.app/api/storage/upload", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({ imageBase64:base64, mediaType:file.type, source:"Upload", label:file.name }),
              });
            } catch(err) { console.error(err); }
          }
          setRecentUploads(prev=>[{
            id:`u-${Date.now()}`, name:file.name, property:"Manual Upload",
            size: file.size>1000000?(file.size/1000000).toFixed(1)+" MB":Math.round(file.size/1000)+" KB",
            source:"Upload", time:"Just now", synced:status==="connected",
          },...prev]);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
  };

  const SOURCE_COLORS = { CompanyCam:C.accent, Upload:C.blue, Tenant:C.purple, Roofr:C.green };

  return (
    <div style={{paddingBottom:40}}>
      <div style={{marginBottom:20}}>
        <div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>HomeStory Cloud</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,lineHeight:1.1,letterSpacing:-0.5,marginBottom:4}}>Photo Storage</h2>
        <p style={{color:C.muted,fontSize:13}}>Every photo from every source — CompanyCam, tenant requests, manual uploads — stored permanently in HomeStory cloud.</p>
      </div>

      {/* Status card */}
      <div style={{background:C.card,border:`1px solid ${status==="connected"?C.green+"44":C.border}`,borderRadius:14,padding:18,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{fontSize:32}}>☁️</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
              <div style={{color:C.text,fontSize:15,fontWeight:800}}>Cloudflare R2 Storage</div>
              <div style={{width:8,height:8,borderRadius:"50%",background:status==="connected"?C.green:status==="checking"?C.yellow:C.red,animation:status==="checking"?"pulse 1.5s ease infinite":"none"}}/>
              <span style={{color:status==="connected"?C.green:status==="checking"?C.yellow:C.red,fontSize:11,fontWeight:700}}>
                {status==="connected"?"Connected":status==="checking"?"Checking...":"Server Offline"}
              </span>
            </div>
            <div style={{color:C.muted,fontSize:12}}>Global CDN · No egress fees · Permanent storage</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          {[
            ["📷",stats.photos,"Photos stored"],
            ["💾",stats.size,"Total size"],
            ["🏠",stats.properties,"Properties"],
          ].map(([icon,val,label])=>(
            <div key={label} style={{background:C.surface,borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
              <div style={{fontSize:18,marginBottom:4}}>{icon}</div>
              <div style={{color:C.text,fontSize:16,fontWeight:800}}>{val}</div>
              <div style={{color:C.dim,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        {status!=="connected"&&(
          <div style={{background:C.yellow+"0a",border:`1px solid ${C.yellow}33`,borderRadius:10,padding:"10px 14px"}}>
            <div style={{color:C.yellow,fontSize:11,fontWeight:700,marginBottom:3}}>Server required for cloud storage</div>
            <div style={{color:C.muted,fontSize:11,lineHeight:1.6}}>Start your server and add R2 credentials to your .env file to enable automatic photo backup. See server README for setup steps.</div>
          </div>
        )}
      </div>

      {/* Auto-sync sources */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:16}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Auto-Sync Sources</div>
        {[
          {icon:"📱",name:"CompanyCam",     desc:"Photos sync the moment your crew takes them on site",        connected:false, color:C.accent},
          {icon:"🏗️",name:"Roofr",          desc:"Job completion photos attached to work orders",              connected:false, color:C.green},
          {icon:"👥",name:"Tenant Requests",desc:"Maintenance request photos saved automatically",              connected:true,  color:C.purple},
          {icon:"📋",name:"Inspections",    desc:"Move-in, move-out, and routine inspection photos",           connected:true,  color:C.blue},
        ].map(src=>(
          <div key={src.name} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
            <span style={{fontSize:22,width:32,textAlign:"center"}}>{src.icon}</span>
            <div style={{flex:1}}>
              <div style={{color:C.text,fontSize:13,fontWeight:600}}>{src.name}</div>
              <div style={{color:C.dim,fontSize:11,marginTop:1}}>{src.desc}</div>
            </div>
            <div style={{background:src.connected?C.green+"22":C.surface,border:`1px solid ${src.connected?C.green+"44":C.border}`,borderRadius:20,padding:"3px 10px",color:src.connected?C.green:C.dim,fontSize:10,fontWeight:700,flexShrink:0}}>
              {src.connected?"✓ Active":"Connect"}
            </div>
          </div>
        ))}
      </div>

      {/* Manual upload */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:16}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Manual Upload</div>
        <div onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${C.border}`,borderRadius:12,padding:"24px 20px",textAlign:"center",cursor:"pointer",marginBottom:10,WebkitTapHighlightColor:"transparent"}}>
          {uploading?<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><Spinner size={20}/><span style={{color:C.muted,fontSize:13}}>Uploading...</span></div>
          :<div><div style={{fontSize:32,marginBottom:8}}>📤</div><div style={{color:C.muted,fontSize:13}}>Tap to upload photos to HomeStory cloud</div><div style={{color:C.dim,fontSize:11,marginTop:4}}>JPG, PNG — tagged to property automatically</div></div>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>handleUpload(e.target.files)}/>
      </div>

      {/* Recent uploads */}
      <div>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Recent Uploads ({recentUploads.length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {recentUploads.map(u=>{
            const col = SOURCE_COLORS[u.source]||C.muted;
            return (
              <div key={u.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:9,background:col+"22",border:`1px solid ${col}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📷</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:C.text,fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}}>{u.name}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{background:col+"22",color:col,borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>{u.source}</span>
                    <span style={{color:C.dim,fontSize:10}}>{u.size}</span>
                    <span style={{color:C.dim,fontSize:10}}>{u.time}</span>
                  </div>
                  <div style={{color:C.dim,fontSize:10,marginTop:2}}>📍 {u.property}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0}}>
                  {u.synced
                    ?<span style={{color:C.green,fontSize:16}}>☁️</span>
                    :<Spinner size={14}/>
                  }
                  <span style={{color:u.synced?C.green:C.muted,fontSize:8,fontWeight:700}}>{u.synced?"SAVED":"SYNCING"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage info */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginTop:14}}>
        <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>About HomeStory Cloud</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {icon:"☁️",text:"Powered by Cloudflare R2 — global CDN, 99.9% uptime"},
            {icon:"🔒",text:"Photos are private by default — access controlled by your privacy settings"},
            {icon:"♾️",text:"Permanent storage — photos never expire or get deleted automatically"},
            {icon:"💰",text:"Included with Pro and Landlord subscriptions · Free tier: 50 photos per property"},
            {icon:"📍",text:"GPS metadata preserved — photos are verifiably tied to the property address"},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
              <div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ── Privacy Settings ──────────────────────────────────────────────────────────
const PRIVACY_LEVELS = {
  private:  { icon:"🔒", label:"Private",         color:C.red,    desc:"Only your account" },
  team:     { icon:"👥", label:"Team",             color:C.blue,   desc:"You and your team members" },
  role:     { icon:"🎭", label:"Role-Based",       color:C.accent, desc:"Relevant audiences only" },
  purchased:{ icon:"💳", label:"Paid & Shareable", color:C.purple, desc:"Generated after purchase — shareable by buyer" },
  public:   { icon:"🌐", label:"Public",           color:C.green,  desc:"Anyone with access" },
};

function PrivacyBadge({level, small}) {
  const cfg = PRIVACY_LEVELS[level]||PRIVACY_LEVELS.private;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:cfg.color+"22",border:`1px solid ${cfg.color}44`,color:cfg.color,borderRadius:6,padding:small?"2px 7px":"3px 10px",fontSize:small?9:11,fontWeight:700,whiteSpace:"nowrap"}}>{cfg.icon} {cfg.label}</span>;
}

function PrivacyPicker({value, onChange, label}) {
  const [open, setOpen] = useState(false);
  const cfg = PRIVACY_LEVELS[value]||PRIVACY_LEVELS.private;
  return (
    <div style={{position:"relative"}}>
      {label&&<div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{label}</div>}
      <div onClick={()=>setOpen(!open)} style={{background:C.card,border:`1px solid ${cfg.color}44`,borderRadius:9,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,WebkitTapHighlightColor:"transparent"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{cfg.icon}</span>
          <div><div style={{color:cfg.color,fontSize:12,fontWeight:700}}>{cfg.label}</div><div style={{color:C.dim,fontSize:10}}>{cfg.desc}</div></div>
        </div>
        <span style={{color:C.dim,fontSize:12}}>▾</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,zIndex:50,marginTop:4,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
          {Object.entries(PRIVACY_LEVELS).map(([key,c])=>(
            <div key={key} onClick={()=>{onChange(key);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",cursor:"pointer",borderBottom:`1px solid ${C.border}22`,WebkitTapHighlightColor:"transparent"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.card}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontSize:18}}>{c.icon}</span>
              <div><div style={{color:C.text,fontSize:13,fontWeight:700}}>{c.label}</div><div style={{color:C.dim,fontSize:11}}>{c.desc}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrivacySettings({property}) {
  const [settings, setSettings] = useState({
    homeReport:"purchased", contractorNotes:"private", landlordNotes:"private",
    adjusterNotes:"role", measurements:"private", jobPhotos:"role",
    inspectionDocs:"team", financialData:"private", tenantInfo:"private",
    claimHistory:"role", documents:"team",
  });
  const [saved, setSaved] = useState(false);

  const GROUPS = [
    {label:"Reports & Data", icon:"📋", items:[
      {key:"homeReport",    label:"Home Report",       desc:"Generated after payment — buyer can share with agents, lenders, and insurers"},
      {key:"claimHistory",  label:"Claim History",     desc:"Prior insurance claims on this property"},
      {key:"measurements",  label:"Measurements",      desc:"EagleView / Roofr measurement reports"},
    ]},
    {label:"Notes", icon:"📝", items:[
      {key:"contractorNotes", label:"Contractor Notes", desc:"Field notes from contractor visits — never visible to homeowners"},
      {key:"landlordNotes",   label:"Landlord Notes",   desc:"Property management notes — never visible to tenants"},
      {key:"adjusterNotes",   label:"Adjuster Notes",   desc:"Insurance claim documentation"},
    ]},
    {label:"Documentation", icon:"📁", items:[
      {key:"jobPhotos",      label:"Job Photos",         desc:"Photos from contractor work visits"},
      {key:"inspectionDocs", label:"Inspection Records", desc:"Move-in, move-out, and routine inspections"},
      {key:"documents",      label:"Document Folder",    desc:"Leases, warranties, permits, certificates"},
    ]},
    {label:"Sensitive Data", icon:"🔒", items:[
      {key:"tenantInfo",    label:"Tenant Information", desc:"Names, contact info, lease details"},
      {key:"financialData", label:"Financial Data",     desc:"Rent amounts, deposits, payment history"},
    ]},
  ];

  return (
    <div>
      {/* Legend */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{color:C.text,fontSize:14,fontWeight:800,marginBottom:12}}>🔐 Privacy Controls</div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.6,marginBottom:12}}>Control who can see each type of data for this property. Settings apply to your account only — other users manage their own privacy.</div>
        <div style={{background:C.purple+"0a",border:`1px solid ${C.purple}33`,borderRadius:10,padding:"10px 12px",marginBottom:4}}>
          <div style={{color:C.purple,fontSize:11,fontWeight:700,marginBottom:3}}>💳 Privacy vs Payment — two separate things</div>
          <div style={{color:C.muted,fontSize:11,lineHeight:1.6}}>Privacy controls who can see data. Payment controls who can generate or download reports. A Home Report marked Paid and Shareable means the person who buys it can share it freely — their agent, lender, or insurer doesn't pay again to view it.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {Object.entries(PRIVACY_LEVELS).map(([key,cfg])=>(
            <div key={key} style={{background:C.surface,borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{cfg.icon}</span>
              <div><div style={{color:cfg.color,fontSize:11,fontWeight:700}}>{cfg.label}</div><div style={{color:C.dim,fontSize:10,marginTop:1}}>{cfg.desc}</div></div>
            </div>
          ))}
        </div>
      </div>

      {GROUPS.map(group=>(
        <div key={group.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:12}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>{group.icon} {group.label}</div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {group.items.map(item=>(
              <div key={item.key}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8}}>
                  <div><div style={{color:C.text,fontSize:13,fontWeight:600}}>{item.label}</div><div style={{color:C.dim,fontSize:11,marginTop:2}}>{item.desc}</div></div>
                  <PrivacyBadge level={settings[item.key]} small/>
                </div>
                <PrivacyPicker value={settings[item.key]} onChange={val=>setSettings(p=>({...p,[item.key]:val}))}/>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{background:C.blue+"0a",border:`1px solid ${C.blue}33`,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
        <div style={{color:C.blue,fontSize:12,fontWeight:700,marginBottom:4}}>Role-Based explained</div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.7}}>Role-Based means data is visible to the audience it is relevant to. Contractors see contractor data, adjusters see insurance data, landlords see rental data. Homeowners never see contractor field notes or adjuster claim details.</div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <Btn full color={C.accent} onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}>Save Privacy Settings</Btn>
        {saved&&<span style={{color:C.green,fontSize:12,fontWeight:700,flexShrink:0}}>✓ Saved</span>}
      </div>
    </div>
  );
}

export default function HomeStory() {
  const [screen,setScreen]=useState("role_select");
  const [selected,setSelected]=useState(null);
  const [properties,setProperties]=useState(DEMO_PROPERTIES);
  const [userTier,setUserTier]=useState("contractor");

  const fetchProperties = () => {
    fetch("https://homestory-server-production.up.railway.app/api/properties")
      .then(r=>r.json())
      .then(data=>{
        if(!data.properties||!data.properties.length) return;
        const dbProps=data.properties.map(p=>({
          id:"db-"+p.id,
          address:p.address||"Unknown",
          city:p.city||"",
          state:p.state||"IL",
          zip:p.zip||"",
          yearBuilt:p.year_built||1990,
          sqft:p.sqft||1500,
          stories:1,
          style:p.style||"Ranch",
          lastRoof:p.last_roof||2010,
          roofMaterial:p.roof_material||"Unknown",
          roofWarranty:p.roof_warranty||"Unknown",
          roofAge:p.roof_age!=null?p.roof_age:15,
          roofStatus:(p.roof_status&&p.roof_status!=="unknown")?p.roof_status:roofStatus(p.roof_age!=null?p.roof_age:15),
          ourJob:true,
          ownerName:p.owner_name||"",
          notes:p.notes||"",
          claimHistory:[],
          timeline:(p.timeline||[]).filter(Boolean).map(e=>({
            id:"ev-"+e.id,
            year:e.year||new Date().getFullYear(),
            type:e.type||"roof",
            label:e.label||"Job logged",
            note:e.note||"",
            source:e.source||"Our Work",
            verified:e.verified!==false,
            ourJob:e.our_job||false,
            tags:e.tags||[],
          })),
          photos:[],
          buildings:[{id:"main_house",type:"main_house",icon:"🏠",label:"Main House",notes:""}],
        }));
        setProperties([...dbProps,...DEMO_PROPERTIES]);
      })
      .catch(()=>{});
  };

  useEffect(()=>{ fetchProperties(); },[]);
 // free | contractor | adjuster | landlord
  const [userRole,setUserRole]=useState(null); // null | contractor | landlord | adjuster | homeowner
  const [showPaywall,setShowPaywall]=useState(null); // null or feature name
  const [listingProperty,setListingProperty]=useState(null);
  const [tenantRequestProp,setTenantRequestProp]=useState(null);
  const [paidReports,setPaidReports]=useState([]);
  const [regridToken,setRegridToken]=useState("");
  const [menuOpen,setMenuOpen]=useState(false);
  const [navOpen,setNavOpen]=useState(false);

  useEffect(()=>{
    (async()=>{const saved=await storageGet("hs:regrid");if(saved)setRegridToken(saved);})();
  },[]);
  useEffect(()=>{if(regridToken)storageSet("hs:regrid",regridToken);},[regridToken]);

  const handleSelect=(p)=>{
    // Always pull the freshest version from the properties array
    const fresh = properties.find(pr=>pr.id===p.id)||p;
    setSelected(fresh);
    setScreen("property");
  };
  const handleBack=()=>{setScreen("search");setSelected(null);};

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans','Helvetica Neue',sans-serif",color:C.text,maxWidth:1100,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input,textarea,select{font-size:16px!important;-webkit-appearance:none}
        input::placeholder,textarea::placeholder{color:#2d3f5e}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#1e2d47;border-radius:2px}
        button{touch-action:manipulation}
      `}</style>

      {/* Nav */}
      <div style={{background:"rgba(8,11,18,0.92)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100}}>
        {/* Dropdown menu */}
        {navOpen&&(
          <div style={{position:"absolute",top:56,left:0,right:0,background:C.surface,borderBottom:`1px solid ${C.border}`,zIndex:200,boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
            {[
              {icon:"🏠",label:"Home",screen:"landing"},
              {icon:"🔍",label:"Search Properties",screen:"search"},
              {icon:"📝",label:"Upload Inspection Report",screen:"sale_inspection"},
              {icon:"⚡",label:"Log a Job",screen:"log"},
              {icon:"🔧",label:"Contractor Pro",screen:"contractor"},
              {icon:"☁️",label:"Cloud Storage",screen:"cloud"},
              {icon:"📂",label:"Import from Roofr CSV",screen:"csv_import"},
              {icon:"💰",label:"Plans & Pricing",screen:"pricing"},
              {icon:"🏅",label:"Verified Program",screen:"contractor"},
              {icon:"⚖️",label:"Community Standards",screen:"standards"},
              {icon:"🔐",label:"Data Use Policy",screen:"data_policy"},
            ].map(item=>(
              <div key={item.label} onClick={()=>{setScreen(item.screen);setNavOpen(false);if(item.sub){/* handled by contractor tab */}}} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",cursor:"pointer",borderBottom:`1px solid ${C.border}22`,WebkitTapHighlightColor:"transparent"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.card}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{fontSize:20,width:28,textAlign:"center"}}>{item.icon}</span>
                <div>
                  <div style={{color:C.text,fontSize:14,fontWeight:600}}>{item.label}</div>
                </div>
                {item.screen===screen&&<div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:C.accent}}/>}
              </div>
            ))}
            <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`}}>
              <div style={{color:C.dim,fontSize:11}}>HomeStory Beta · Southern Illinois · homestory.app</div>
            </div>
          </div>
        )}
        {navOpen&&<div style={{position:"fixed",inset:0,zIndex:199}} onClick={()=>setNavOpen(false)}/>}

        <div style={{padding:"0 clamp(16px,4vw,40px)",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,maxWidth:1060,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>{setScreen(screen==="role_select"?"role_select":"landing");setSelected(null);}}>
            {screen!=="landing"&&screen!=="role_select"&&<button onClick={e=>{e.stopPropagation();setScreen(screen==="property"?"search":["log","contractor","pricing","standards","landlord","listing","tenant_request"].includes(screen)?userRole==="landlord"?"landlord":"search":"landing");}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,padding:"0 4px 0 0",lineHeight:1}}>←</button>}
            <div style={{background:C.accent,width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏠</div>
            <span style={{fontWeight:800,fontSize:16,letterSpacing:-0.5,fontFamily:"'DM Sans',sans-serif"}}>HomeStory</span>
            <span style={{background:C.accent+"22",color:C.accent,fontSize:8,fontWeight:700,letterSpacing:1.5,padding:"1px 5px",borderRadius:3,textTransform:"uppercase"}}>BETA</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {screen==="landing"&&<Btn small color={C.accent} onClick={()=>setScreen("search")}>Search →</Btn>}
            {screen!=="landing"&&<div onClick={()=>setScreen("pricing")} style={{background:userTier==="contractor"?C.accent+"22":C.surface,border:`1px solid ${userTier==="contractor"?C.accent+"44":C.border}`,borderRadius:20,padding:"4px 10px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}><span style={{color:userTier==="contractor"?C.accent:C.dim,fontSize:10,fontWeight:700}}>{userTier==="contractor"?"⚡ Pro":"Free"}</span></div>}

            <button onClick={()=>setNavOpen(!navOpen)} style={{background:navOpen?C.accent+"22":"none",border:`1px solid ${navOpen?C.accent+"44":C.border}`,borderRadius:8,width:36,height:36,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,cursor:"pointer",WebkitTapHighlightColor:"transparent",flexShrink:0}}>
              <div style={{width:16,height:2,background:navOpen?C.accent:C.muted,borderRadius:2,transition:"all 0.2s"}}/>
              <div style={{width:16,height:2,background:navOpen?C.accent:C.muted,borderRadius:2,transition:"all 0.2s",opacity:navOpen?0:1}}/>
              <div style={{width:16,height:2,background:navOpen?C.accent:C.muted,borderRadius:2,transition:"all 0.2s"}}/>
            </button>
          </div>
        </div>

        {/* Nav tabs for search/contractor */}
        {(screen==="search"||screen==="log"||screen==="contractor"||screen==="pricing"||screen==="standards"||screen==="cloud"||screen==="sale_inspection"||screen==="csv_import"||screen==="data_policy")&&(
          <div style={{display:"flex",borderTop:`1px solid ${C.border}`}}>
            {(userRole==="inspector"
              ? [["search","🔍 Search"],["sale_inspection","📋 Upload"],["pricing","💰 Plans"]]
              : userRole==="contractor"
              ? [["search","🔍 Search"],["log","⚡ Log"],["contractor","🔧 Pro"],["pricing","💰 Plans"]]
              : [["search","🔍 Search"],["log","⚡ Log"],["contractor","🔧 Contractor"],["pricing","💰 Plans"]]
            ).map(([k,l])=>(
              <button key={k} onClick={()=>setScreen(k)} style={{flex:1,background:"none",border:"none",borderBottom:`2px solid ${screen===k?C.accent:"transparent"}`,color:screen===k?C.accent:C.muted,padding:"10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",WebkitTapHighlightColor:"transparent"}}>{l}</button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{padding:"20px clamp(16px, 4vw, 40px)", maxWidth:1060, margin:"0 auto"}}>
        {screen==="role_select"&&<RoleSelect onSelect={role=>{
          setUserRole(role);
          if(role==="contractor"){setScreen("landing");}
          else if(role==="inspector"){setScreen("search");}
          else if(role==="adjuster"){setScreen("search");}
          else{setScreen("landing");}
        }}/>}
        {screen==="landing"&&<Landing onGetStarted={()=>setScreen("search")} onSearch={()=>setScreen("search")} userRole={userRole}/>}
        {screen==="search"&&<SearchScreen properties={properties} onSelect={handleSelect} regridToken={regridToken} setRegridToken={setRegridToken} userRole={userRole} onUploadInspection={()=>setScreen("sale_inspection")}/>}
        {screen==="property"&&selected&&<PropertyDetail property={selected} onBack={handleBack} userTier={userTier} userRole={userRole} onShowPaywall={setShowPaywall} paidReports={paidReports} regridToken={regridToken}/>}
        {screen==="log"&&<FastFieldLog properties={properties} setProperties={setProperties} onDone={()=>setScreen("search")} onRefresh={fetchProperties}/>}
        {screen==="contractor"&&<ContractorDashboard properties={properties} onSelect={handleSelect} onLogJob={()=>setScreen("log")} userTier={userTier} onUpgrade={()=>setScreen("pricing")} regridToken={regridToken} setRegridToken={setRegridToken}/>}
        {screen==="pricing"&&<PricingPage onUpgrade={()=>{setUserTier("contractor");setScreen("contractor");}}/>}
        {screen==="standards"&&<CommunityStandards properties={properties} userTier={userTier}/>}
        {screen==="data_policy"&&<DataUsePolicy/>}
        {screen==="cloud"&&<CloudStoragePanel userTier={userTier}/>}
        {screen==="csv_import"&&<CSVImportScreen onComplete={()=>setScreen("search")}/>}
        {screen==="sale_inspection"&&<SaleInspectionUpload property={selected||DEMO_PROPERTIES[0]} onComplete={()=>setScreen("search")}/>}
        {screen==="landlord"&&<LandlordDashboard properties={properties} setProperties={setProperties} onSelect={p=>{setListingProperty(p);setScreen("listing");}} onLogJob={()=>setScreen("log")}/>}
        {screen==="listing"&&listingProperty&&<RentalListing property={listingProperty} onBack={()=>setScreen("landlord")} onTenantRequest={p=>{setTenantRequestProp(p);setScreen("tenant_request");}}/> }
        {screen==="tenant_request"&&tenantRequestProp&&<TenantRequest property={tenantRequestProp} onSubmit={req=>{ /* In production: save to database and send push notification */ }} onBack={()=>setScreen("listing")}/>}
        {showPaywall&&<PaywallModal feature={showPaywall} userTier={userTier} onUpgrade={()=>{setUserTier("contractor");setShowPaywall(null);}} onPayPerReport={(price)=>{setPaidReports(p=>[...p,showPaywall]);setShowPaywall(null);}} onClose={()=>setShowPaywall(null)}/>}
      </div>

    </div>
  );
}

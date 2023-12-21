let orangeMeta = "#FB360E"

let overlay_style = `
position: fixed;
inset: 0 !important;
border: none;
padding: 0;
background-color: rgba(0, 0, 0, 0.5);
top: 0 !important;
margin: 0 !important;
opacity: 0;
transition: opacity .25s cubic-bezier(.25, 0, .3, 1);
outline: none;
`;

let image_style = `
width: 225px;
height: auto;
padding: 20px;
box-sizing: border-box;
`;

let link_logo_style = `
width: 15px;
height: auto;
`;
let time_logo_style = `
width: 15px;
height: auto;
`;
let lines_container = `
position: relative;

`
let lines_style = `
position: absolute;
top: 0;
left: 0;
margin: auto;
`

let input_style = `
border: 0px solid;
background-color: transparent;
color: white;
font-size: 20px;
outline: none;
font-family: MartianMono, sans-serif;
z-index: 99999 !important;
position: relative;
text-align: center;
width: 145px; 
padding: 10px;
`;

let form_style = `
display: flex;
align-items: center;
justify-content: center;
`;

let button_style = `
font-family: MartianMono, sans-serif;
width: 100px;
height: 35px;
line-height: 20px;
padding: 0;
border: none;
/* background: linear-gradient(0deg, rgba(255,27,0,1) 0%, rgba(251,75,2,1) 100%); */
background: ${orangeMeta};
cursor: pointer;
border-radius: 5px;
font-size: 12px;
color: white;
/* margin-left: 10px; */
`;

let link_button_style = `
width: 35px;
height: 35px;
line-height: 20px;
padding: 0;
border: none;
/* background: linear-gradient(0deg, rgba(255,27,0,1) 0%, rgba(251,75,2,1) 100%); */
background: ${orangeMeta};
cursor: pointer;
border-radius: 100%;
margin-left: 15px;
display: flex;
justify-content: center;
align-items: center;
`;
let time_button_style = `
width: 35px;
height: 35px;
line-height: 20px;
padding: 0;
border: none;
/* background: linear-gradient(0deg, rgba(255,27,0,1) 0%, rgba(251,75,2,1) 100%); */
background: ${orangeMeta};
cursor: pointer;
border-radius: 100%;
margin-left: 15px;
display: flex;
justify-content: center;
align-items: center;
`;

let current_place = document.querySelector(".current_place");

let city;
let country;


let position_btn=document.querySelector(".use_current_location span");
let settings = document.querySelector(".settings span")

let latitude;
let longitude;

let fajr = document.getElementById("item_time_fajr")
let shorok = document.getElementById("item_time_shorok")
let dohr = document.getElementById("item_time_dohr")
let asr = document.getElementById("item_time_asr")
let maghrib = document.getElementById("item_time_maghrib")
let isha = document.getElementById("item_time_isha");


let section1 = document.querySelector(".section1");
let section2 = document.querySelector(".section2");
let section2_loading = document.querySelector(".section2_loading");
let section_next_pray = document.querySelector(".section_next_pray");


const select_menu = document.getElementById("places");
let selectedValue = "asima";

// using city and country 
function get_data(country,city){
    return new Promise(function (resolve,reject){
        fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=5`)
        .then((res) => res.json())
        .then((res)=>{
            section2_loading.style.display="none"
            section2.style.display = "flex"
            section_next_pray.style.display = "block"


            let timings = res.data.timings;
            // console.log(timings);
            fajr.innerHTML=`${timings.Fajr}`
            shorok.innerHTML=`${timings.Sunrise}`
            dohr.innerHTML=`${timings.Dhuhr}`
            asr.innerHTML=`${timings.Asr}`
            maghrib.innerHTML=`${timings.Maghrib}`
            isha.innerHTML=`${timings.Isha}`
            // next_pray()
            setInterval(next_pray, 1000);
            resolve();
        });
    })
    
}






// handle the current postion isus 
function get_position(){
    return new Promise((resolve,reject)=>{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            get_current_position_data(latitude,longitude)
            setInterval(next_pray, 1000);
            
            resolve();
        }, function (error) {
            console.log("Error getting geolocation:", error.message);
            reject(error)
        });
        } else {
            console.log("Geolocation is not supported by this browser.");
            reject(new Error("Geolocation not supported"))
        }
        })
}



function get_current_position_data(latitude,longitude){
    
    fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=5`)
    .then((res)=>res.json())
    .then((res)=>{
        section2_loading.style.display="none"
        section2.style.display = "flex"
        section_next_pray.style.display = "block"

        let timings = res.data.timings;
        // console.log(timings);
        fajr.innerHTML=`${timings.Fajr}`
        shorok.innerHTML=`${timings.Sunrise}`
        dohr.innerHTML=`${timings.Dhuhr}`
        asr.innerHTML=`${timings.Asr}`
        maghrib.innerHTML=`${timings.Maghrib}`
        isha.innerHTML=`${timings.Isha}`


        current_place.innerHTML = latitude + " / " + longitude;
        current_place.style.textDecoration = 'none'
    });

}
position_btn.addEventListener("click",function(){
    position_btn.classList.add("active_btn")
    section2_loading.style.display="flex";
    section2.style.display="none";
    section_next_pray.style.display = "none"
    get_position()
    .catch((error) => {
        section2_loading.style.display="none";
        section2.style.display="flex";
        document.querySelector(".prayer_times").style.display = "none"
        position_btn.classList.remove("active_btn")
        });
    
});





// the select block 
function update_data(country,city){
    section2_loading.style.display="flex";
    section2.style.display="none";
    position_btn.classList.remove("active_btn")
    document.querySelector(".prayer_times").style.display = "block"
    current_place.style.textDecoration = 'underline'
    get_data(country,city)
}
select_menu.addEventListener("change", function() {
    selectedValue = this.value;
    switch(selectedValue){
        case "maka":
            current_place.innerHTML = "مكة المكرمة";
            city="maka al mokarama";
            country = "SA"
            break;
        case "el-madina":
            current_place.innerHTML = "المدينة المنورة"
            city="al madina el monawara";
            country = "SA"
            break;
        case "asima":
            current_place.innerHTML = "الجزائر العاصمة";
            city="Alger";
            country = "DZ"
            break;
        case "cairo":
            current_place.innerHTML = "القاهرة";
            city="Cairo";
            country = "EG"
            break;
    }
    update_data(country,city);
});




//  start working with the counter part
function next_pray(){
    let today = new Date();
    let todayy_hour = today.getHours();
    let todayy_munits = today.getMinutes();
    let todayy_sec = today.getSeconds();

    let total_remaining_sec ;
    let remaining_hour ;
    let remaining_minuts ;
    let remaining_sec ;

    let current_time = todayy_hour*3600 + todayy_munits*60 + todayy_sec;

    let prayerTimes = [
        timeToSeconds(fajr),
        timeToSeconds(dohr),
        timeToSeconds(asr),
        timeToSeconds(maghrib),
        timeToSeconds(isha)
    ]
    const prayerNames = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"];

    //compare the urrent time with the pray times 
    let nextPrayerIndex = prayerTimes.findIndex(time => time > current_time);
    // If the next prayer time is not found, it means it's past the last prayer time, so the next prayer will be the first one tomorrow
    if (nextPrayerIndex === -1) {
        nextPrayerIndex = 0;
    }
    document.getElementById("next_pray_name").innerHTML = prayerNames[nextPrayerIndex];

    total_remaining_sec = prayerTimes[nextPrayerIndex] - current_time;


    remaining_hour = Math.floor(total_remaining_sec / 3600);  
    remaining_minuts = Math.floor((total_remaining_sec % 3600)/60);  
    remaining_sec = Math.floor((total_remaining_sec % 3600)%60);  

    remaining_hour = String(remaining_hour).padStart(2, '0');
    remaining_minuts = String(remaining_minuts).padStart(2, '0');
    remaining_sec = String(remaining_sec).padStart(2, '0');


    document.querySelector(".hour").innerHTML = remaining_hour;
    document.querySelector(".minuts").innerHTML = remaining_minuts;
    document.querySelector(".seconds").innerHTML = remaining_sec;
    
}

function timeToSeconds(time) {
    const [hour, minute] = time.textContent.split(':').map(Number);
    return hour * 3600 + minute * 60;
}



// function handleSettingsToggle() {
//     const settingsBlock = document.querySelector(".settings_block");
//     const isSettingsVisible = settingsBlock.style.display === "block";

//     // Toggle the display of the settings block
//     settingsBlock.style.display = isSettingsVisible ? "none" : "block";
// }

// // Add a click event listener to the settings logo and close button
// document.getElementById("settings_logo").addEventListener("click", handleSettingsToggle);
// document.getElementById("close_button").addEventListener("click", handleSettingsToggle);

// // Add a click event listener to the document to handle clicks outside the settings block
// document.addEventListener("click", function (event) {
//     const settingsBlock = document.querySelector(".settings_block");

//     // Check if the clicked element is the settings block or its descendant
//     if (!settingsBlock.contains(event.target)) {
//         // Hide the settings block
//         settingsBlock.style.display = "none";
//     }
// });




// default place
get_data("DZ","Alger")

//https://biz1.samsungcsportal.com/gspn/operate.do?cmd=ServiceOrderDetailLiteCmd&objectID=4273320799
//https://biz1.samsungcsportal.com/gspn/operate.do?cmd=ZifGspnSvcMainLDCmd&objectID=4273320799

console.log('GSPN.js');

class isemri{constructor() {}}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
		console.log('listener başladı');
		console.log(sender.tab ?
					"from a content script:" + sender.tab.url :
					"from the extension");
		if (request.action === "check"){
			console.log('check geldi');

			let frameObj = document.getElementById('rightContents');
			if(frameObj){

				let frameUrl = frameObj.contentWindow.location.href;
				console.log('frameUrl:'+frameUrl);
				if(frameUrl.includes("cmd=ServiceOrderDetailLiteCmd")){

					var result = kontrol();

					if(result){
						sendResponse({status: true, message:"data geldi", data: result});
					}else{
						sendResponse({status: false, message:"sayfa içinden data alınamadı!"});
					}

				}else if(frameUrl.includes("cmd=ZifGspnSvcMainLDCmd")){

					var result = kontrolEdit();

					if(result){
						sendResponse({status: true, message:"data geldi", data: result});
					}else{
						sendResponse({status: false, message:"sayfa içinden data alınamadı!"});
					}

				}else{
					console.log('Frame Url hatalı (cmd=ZifGspnSvcMainLDCmd // cmd=ServiceOrderDetailLiteCmd)');
					sendResponse({status: false, message:"Doğru sayfada olduğumuza emin misin?"});
				}

			}else{
				console.log('iFrame yok (rightContents)');
				sendResponse({status: false, message:"Kaybolduk sanki! iFrame yok!"});
			}
		}
    }
);


function kontrolEdit(){
	console.log('Edit açıldı');
	
	var veri = new isemri();
    console.log('GSPN Kontrol function started');
	let frameObj = document.getElementById('rightContents');
	if(!frameObj){console.log('iFrame yok (rightContents)'); return false;}

	let merkeznoObj = frameObj.contentWindow.document.getElementById('OBJECT_ID');
	if(!merkeznoObj){console.log('merkezno objesi yok (OBJECT_ID)'); return false;}
	
	let merkezno = merkeznoObj.value.trim();
	if(merkezno.length === 0){console.log('Merkez No boş!'); return false;}
	veri.merkezno = merkezno;

	let requestDateObj = frameObj.contentWindow.document.getElementById('REQUEST_DATE');
	if(requestDateObj){
		let z = requestDateObj.value.split('.');
		veri.ziyaret = z[1]+'.'+z[0]+'.'+z[2];		
	}else{
		console.log('requestDateObj objesi yok (REQUEST_DATE)');
		return false;
	}

	let mobileNoObj = frameObj.contentWindow.document.getElementById('MOBILE_NUMBER');
	let homeNoObj = frameObj.contentWindow.document.getElementById('HOMEPHON_NUMBER');
	let officeNoObj = frameObj.contentWindow.document.getElementById('OFFICEPHON_NUM');
	if(mobileNoObj || homeNoObj || officeNoObj){
		let telefonlar = ((mobileNoObj)?mobileNoObj.value+' ':'')+((homeNoObj)?homeNoObj.value+' ':'')+((officeNoObj)?officeNoObj.value+' ':'');
		veri.telefon = tels(tmz(telefonlar));
		//veri.musteri = isim(tmz(nameFirstObj.value).trim()+' '+tmz(nameLastObj.value).trim());
	}else{
		console.log('telefon bilgileri yok (MOBILE_NUMBER, HOMEPHON_NUMBER, OFFICEPHON_NUM)');
		return false;
	}

	let ilObj = frameObj.contentWindow.document.getElementById('CITY');
	if(ilObj){
		veri.il = tmz(ilObj.value);
	}else{
		console.log('ilObj objesi yok (CITY)');
		return false;
	}

	let ilceObj = frameObj.contentWindow.document.getElementById('City/District');
	if(ilceObj){
		veri.ilce = tmz(ilceObj.innerText.replace('ISTANBUL','').replace('İSTANBUL','').trim());
	}else{
		console.log('ilceObj objesi yok (City/District)');
		return false;
	}

	let streetObj = frameObj.contentWindow.document.getElementById('STREET');
	if(streetObj){
		veri.adres = tmz(streetObj.value);
	}else{
		console.log('adres objesi yok (STREET)');
		return false;
	}


	let nameFirstObj = frameObj.contentWindow.document.getElementById('NAME_FIRST');
	let nameLastObj = frameObj.contentWindow.document.getElementById('NAME_LAST');
	if(nameFirstObj && nameLastObj){
		veri.musteri = isim(tmz(nameFirstObj.value).trim()+' '+tmz(nameLastObj.value).trim());
	}else{
		console.log('musteri isim bilgileri yok (NAME_FIRST NAME_LAST)');
		return false;
	}

	let serviceTypeObj = frameObj.contentWindow.document.getElementById('SERVICE_TYPE');
	if(serviceTypeObj){
		let rand = serviceTypeObj.options[serviceTypeObj.selectedIndex].value;
		console.log(rand);
		veri.randevu = serviceTypeObj.options[serviceTypeObj.selectedIndex].value;
	}else{
		console.log('serviceTypeObj objesi yok (SERVICE_TYPE)');
		return false;
	}

	let defectDescObj = frameObj.contentWindow.document.getElementById('DEFECT_DESC');
	if(defectDescObj){
		veri.talep = defectDescObj.value;
	}else{
		console.log('defectDescObj objesi yok (DEFECT_DESC)');
		return false;
	}

	let urunObj = frameObj.contentWindow.document.getElementById('MODEL');
	if(urunObj){
		veri.urun = tmz(urunObj.value);
	}else{
		console.log('urunObj objesi yok (MODEL)');
		return false;
	}

	let seriObj = frameObj.contentWindow.document.getElementById('SERIAL_NO');
	if(seriObj){
		veri.seri = tmz(seriObj.value);
	}else{
		console.log('seriObj objesi yok (SERIAL_NO)');
	}

	return veri;
}



function kontrol(){
	var veri = new isemri();
    console.log('GSPN Kontrol function started');
	let frameObj = document.getElementById('rightContents');
	if(!frameObj){console.log('iFrame yok (rightContents)'); return false;}

	let merkeznoObj = frameObj.contentWindow.document.getElementById('OBJECT_ID');
	if(!merkeznoObj){console.log('merkezno objesi yok (OBJECT_ID)'); return false;}
	
	let merkezno = merkeznoObj.value.trim();
	if(merkezno.length === 0){console.log('Merkez No boş!'); return false;}
	veri.merkezno = merkezno;

	let ziyaretObj = frameObj.contentWindow.document.getElementById('customerreqin');
	if(!ziyaretObj){console.log('ziyaretObj objesi yok (customerreqin)');}
	let ziyaret = tmz(ziyaretObj.innerHTML);
	ziyaret = ziyaret.substring(0,10);
	let z = ziyaret.split('.');
	veri.ziyaret = z[1]+'.'+z[0]+'.'+z[2];

	let ilceObj = frameObj.contentWindow.document.getElementById('City/District');
	if(!ilceObj){console.log('ilce objesi yok (City/District)');}
	veri.ilce = tmz(ilceObj.innerText).replace('ISTANBUL','').replace('İSTANBUL','').trim();

	let emailObj = frameObj.contentWindow.document.getElementById('d_EMAIL');
	if(!emailObj){console.log('email objesi yok (d_EMAIL)');}
	veri.email = tmz(emailObj.innerText);

	let adresObj = frameObj.contentWindow.document.getElementById('d_STREET');
	if(!adresObj){console.log('adres objesi yok (d_STREET)');}
	veri.adres = tmz(adresObj.innerText);

	let telefonObj = frameObj.contentWindow.document.getElementById('TELTEXT');
	if(!telefonObj){console.log('telefon objesi yok (TELTEXT)');}
	veri.telefon = tels(tmz(telefonObj.innerText).trim());

	let musteriObj = frameObj.contentWindow.document.getElementById('d_CUSTNAME');
	if(!musteriObj){console.log('musteri objesi yok (d_CUSTNAME)');}
	veri.musteri = isim(tmz(musteriObj.innerHTML).replace('Son Müşteri,','').trim());

	let serviceTypeObj = frameObj.contentWindow.document.getElementById('trSvcType');
	if(!serviceTypeObj){console.log('serviceTypeObj objesi yok (serviceTypeObj)');}

	let randevuObj = serviceTypeObj.querySelector('.ser_td');
	if(!randevuObj){console.log('randevuObj objesi yok (.ser_td)');}
	veri.randevu = tmz(randevuObj.innerText).substring(0, 2);

	let urunObj = frameObj.contentWindow.document.querySelector('table tr td.padR_2');
	if(!urunObj){console.log('urunObj objesi yok (table tr td.padR_2)');}
	veri.urun = tmz(urunObj.innerHTML);

	let seriObj = frameObj.contentWindow.document.querySelector('#moretailid3 table tr:nth-child(2) td:nth-child(2) table tr td');
	if(!seriObj){console.log('seriObj objesi yok (table tr td.padR_2)');}
	veri.seri = tmz(seriObj.innerHTML);

	let talepObj = frameObj.contentWindow.document.querySelector('#moretailid3 table tr:nth-child(8) td:nth-child(2)');
	if(!talepObj){console.log('talepObj objesi yok (table tr td.padR_2)');}
	veri.talep = tmz(talepObj.innerHTML);

	return veri;
}

function tmz(str){
    str = str.replace(/[\n\t\r]/g,' ').trim();
    str = str.replace(/&nbsp;/g,' ').trim();
    str = str.replace(/  /g,' ').trim();
    str = str.replace('[Ev]','').trim();
    str = str.replace('[Cep]','').trim();
    str = str.replace('[Ofis]','').trim();
    str = str.replace(/  /g,' ').trim();
    str = str.replace(/  /g,' ').trim();
    str = str.trim();
    return str;
}

function tels(datas){
    let tels = datas.split(' ');
    let uniqueTels = [...new Set(tels)];
    return uniqueTels;
}

function isim(isim){
	return [...new Set(isim.split(' '))].join(' ');
}
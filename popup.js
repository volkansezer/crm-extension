
const divMain = document.querySelector('#divMain');
const divForm = document.querySelector('#divForm');
const spanDurum = document.querySelector('#spanDurum');
var apiUrl = "";



$(document).ready(function () {

	main();

});


async function main() {

	const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });	//console.log(currentTab.url);

	const result = await chrome.storage.local.get(['savedUrl']);


	// Eğer savedUrl yoksa veya boş bir metinse
	if (!result.savedUrl) {
		console.log("Hata: Kayıtlı URL bulunamadı!");
		spanDurum.innerHTML = '> API URL girilmedi!';
		return false;
	}

	if (result.savedUrl == '' || result.savedUrl == null) {
		spanDurum.innerHTML = '> API URL eskik veya hatalı!';
		return false;
	}

	apiUrl = `https://${result.savedUrl}/api/ext/`;

	if (!currentTab.url.includes(result.savedUrl) && !currentTab.url.includes("samsungcsportal.com/gspn")) {
		spanDurum.innerHTML = '> Doğru sayfada değiliz..!';
		//divMain.style.display='inline';
		//divMain.innerHTML='Sevemedim kara gözlüm!';
		return false;
	}

	if (currentTab.url.includes(result.savedUrl)) {
		console.log("CRM'deyiz, giriş kontrol ediliyor");
		spanDurum.innerHTML = "> CRM'deyiz, giriş kontrol ediliyor...";
		var resLogin = await checkLogin();
		console.log(resLogin);
		if (resLogin) {
			divMain.innerHTML = '<div class="alert alert-primary" role="alert">Giriş yapılmış, GSPNden data alabilirsiniz</div>';
			return true;
		} else {
			divMain.innerHTML = '<div class="alert alert-warning" role="alert">Lütfen CRMden giriş yapınız...</div>';
			return false;
		}
	}


	console.log("GSPN'deyiz, CRM giriş kontrol ediliyor");
	spanDurum.innerHTML = "GSPN'deyiz, giriş kontrol ediliyor";
	var resLogin = await checkLogin();

	if (!resLogin) {
		divMain.innerHTML = '<div class="alert alert-warning" role="alert">Lütfen CRMden giriş yapınız...</div>';
		return false;
	}

	console.log("> Sayfadan bilgiler alınıyor");
	spanDurum.innerHTML = "> Sayfadan bilgiler alınıyor...";

	const response = await chrome.tabs.sendMessage(currentTab.id, { action: "check", data: "merkezno" });
	console.log(response);
	spanDurum.innerHTML = "> Sayfadan gelen bilgiler kontrol ediliyor...";
	divMain.style.display = 'inline';

	if (!response.hasOwnProperty("status")) {
		console.log('Gelen mesajda status yok');
		divMain.innerHTML = '<div class="alert alert-danger" role="alert">Hay Aksi! Sayfadan bilgi alınamadı :(</div>';
		return false;
	}

	if (!response.status) {
		console.log('status false geldi')
		divMain.innerHTML = '<div class="alert alert-warning" role="alert">' + response.message + '</div>';
		return false;
	}

	console.log(response.data.merkezno.length);

	if (response.data.merkezno.length != 10) {
		console.log('merkezno boş veya hatalı')
		divMain.innerHTML = '<div class="alert alert-warning" role="alert">Merkez No boş veya hatalı</div>';
		return false;
	}

	var merkezno = response.data.merkezno;
	console.log(merkezno)

	divMain.innerHTML = '<div class="alert alert-warning" role="alert"><h2>' + merkezno + '</h2></div> Merkez no alındı, sistemden kontrol ediliyor';
	spanDurum.innerHTML = "> Merkez No, CRM'den kontrol ediliyor...";
	var merkeznoKontrol = await merkeznokontrol(merkezno);
	if (!merkeznoKontrol) {
		console.log('kayıt kontrol edilemedi veya zaten var!');
		return false;
	}

	//return false;
	spanDurum.innerHTML = "> Yeni kayıt için form hazırlanıyor...";

	await load();

	divMain.style.display = 'none';
	divForm.style.display = 'inline';

	/* verileri temizle düzenle */
	let isim = isimbol(response.data.musteri);
	if (response.data.seri == 'M000') { response.data.seri = ''; }

	let randevuIndex = (response.data.randevu == 'II') ? 1 : (response.data.randevu == 'IH') ? 2 : 0;
	console.log(randevuIndex);


	/* verileri forma ekle */
	$('#merkezno').val(response.data.merkezno);
	$('#ziyaret').val(response.data.ziyaret);
	$('#adi').val(isim[0]);
	$('#soyadi').val(isim[1]);
	$('#tel1').val(response.data.telefon[0]);
	$('#tel2').val(response.data.telefon[1]);

	$("#ilce option").filter(function () { return $(this).text() == response.data.ilce; }).prop('selected', true);
	$('#ilce').change();

	$('#adres').val(response.data.adres);

	$('#randevu option').eq(randevuIndex).prop('selected', true);

	$('#urungam option').filter(function () { return $(this).val() == modelId(response.data.urun); }).prop('selected', true);

	$('#model').val(response.data.urun);
	$('#seri').val(response.data.seri);

	$('#talep').val(response.data.talep);

	spanDurum.innerHTML = "> Yeni kayıt için form hazır!";
}




function isimbol(data) {
	let datas = data.split(' ');
	let uDatas = [...new Set(datas)];
	if (uDatas.length == 2) { return uDatas; }
	if (uDatas.length == 3) { return [uDatas[0] + ' ' + uDatas[1], uDatas[2]]; }
	if (uDatas.length == 4) { return [uDatas[0] + ' ' + uDatas[1], uDatas[2] + ' ' + uDatas[3]]; }
	return ['', ''];
}

function modelId(model) {
	let mkod = [];

	mkod['UD'] = 1; mkod['UE'] = 1; mkod['UF'] = 1; mkod['LE'] = 1; mkod['LW'] = 1; mkod['CW'] = 1; mkod['SP'] = 1; mkod['PS'] = 1; mkod['QE'] = 1;
	mkod['RH'] = 2; mkod['RF'] = 2; mkod['RT'] = 2; mkod['RL'] = 2; mkod['RS'] = 2; mkod['SR'] = 2; mkod['SG'] = 2; mkod['RB'] = 2; mkod['RZ'] = 2;
	mkod['WW'] = 3; mkod['WF'] = 3; mkod['WD'] = 3; mkod['DM'] = 3; mkod['Q1'] = 3;
	mkod['DW'] = 4; mkod['DM'] = 4; mkod['DS'] = 4;
	mkod['AQ'] = 5; mkod['AR'] = 5; mkod['AF'] = 5;
	mkod['DA'] = 6; mkod['HT'] = 6; mkod['HW'] = 6;
	mkod['DV'] = 7;
	mkod['BQ'] = 8; mkod['BT'] = 8; mkod['NS'] = 8; mkod['NV'] = 8; mkod['BF'] = 8; mkod['NA'] = 8; mkod['FW'] = 8;
	mkod['CT'] = 9; mkod['GN'] = 9; mkod['NA'] = 9;
	mkod['HC'] = 10; mkod['HD'] = 10; mkod['NK'] = 10;
	mkod['CE'] = 11; mkod['GE'] = 11; mkod['GW'] = 11; mkod['ME'] = 11; mkod['MA'] = 11; mkod['MW'] = 11; mkod['MG'] = 11; mkod['MS'] = 11;
	mkod['VC'] = 12;

	return mkod[model.substring(0, 2)];
}

async function load() {
	console.log('Load start');

	$.ajax({
		url: apiUrl + 'getdata.php',
		global: false,
		type: 'GET',
		data: { action: 'ilceler' },
		async: false, //blocks window close
		success: function (data, status) {
			if (status) {
				//console.log(data);
				$('#ilce').empty();
				$("#ilce").append('<option value="" disabled selected>--İLÇE SEÇİN--</option>');
				$.each(data, function (key, value) {
					$("#ilce").append('<option value="' + value.id + '">' + value.ilce + '</option>');
				});
			} else {
				alert('İlçeler alınamadı!');
			}
		}
	});

	$.ajax({
		url: apiUrl + 'getdata.php',
		global: false,
		type: 'GET',
		data: { action: 'urungam' },
		async: false, //blocks window close
		success: function (data, status) {
			if (status) {
				//console.log(data);
				$('#urungam').empty();
				$("#urungam").append('<option value="" disabled selected>--ÜRÜN SEÇİN--</option>');
				$.each(data, function (key, value) {
					$("#urungam").append('<option value="' + value.id + '">' + value.gam + '</option>');
				});
			} else {
				alert('Ürünler alınamadı!');
			}
		}
	});

	$("#ziyaret").datepicker({
		minDate: "D", // seçilebilirlik, D bugün, +1D yaryn
		firstDay: 1, // haftanyn ba?langyç günü
		//beforeShowDay: noSunday,
		dateFormat: "dd.mm.yy" // Tarih formaty
	});

	console.log('Load end');
}


async function merkeznokontrol(merkezno) {
	console.log('merkeznokontrol start');
	var response = false;
	console.log(merkezno);
	if (merkezno == '') { console.log('merkez no boş'); return false; }

	$.ajax({
		url: apiUrl + 'kontrol.php',
		type: 'POST',
		data: { merkezno: merkezno },
		//contentType: 'application/json',
		async: false, //blocks window close
	}).done(function (data) {
		if (data.hasOwnProperty('status') && data.hasOwnProperty('message')) {

			if (data.status) {
				console.log(data.status);
				response = true;
				divMain.innerHTML = '<div class="alert alert-primary" role="alert"><h3>' + merkezno + '</h3></div> Kayıt yok, form hazırlanıyor!';
			} else {
				divMain.innerHTML = '<div class="alert alert-warning" role="alert"><h3>' + merkezno + '</h3></div> <b>' + data.data.id + '</b> CRM numarası ile kayıt zaten var';
			}

		} else {
			divMain.innerHTML = '<div class="alert alert-warning" role="alert"><h3>' + merkezno + '</h3></div> Merkez no kontrol edilemedi!';
		}
	})
		.fail((err) => {
			divMain.innerHTML = '<div class="alert alert-danger" role="alert"><h3>' + merkezno + '</h3></div> Hay aksi! Bir şeyler ters gitti...';
			console.log(err);
		})
	console.log('merkeznokontrol end');
	return response;
}

async function checkLogin() {
	var response = false;
	$.ajax({
		url: apiUrl + 'ping.php',
		global: false,
		type: 'GET',
		data: {},
		async: false, //blocks window close
		success: function (data, status) {
			if (status) {
				if (data == 'true') {
					response = true;
				}
			} else {
				alert('Giriş kontrol edilemedi!');
			}
		}
	});
	return response;
}


$('#ilce').on('change', function () {
	//console.log(this.value);				
	$.ajax({
		url: apiUrl + 'getdata.php',
		global: false,
		type: 'GET',
		data: { action: 'mahalleler', ilce: this.value },
		async: false, //blocks window close
		success: function (data, status) {
			if (status) {
				//console.log(data);
				$('#mahalle').empty();
				$("#mahalle").append('<option value="" disabled selected>--MAHALLE SEÇİN--</option>');
				$.each(data, function (key, value) {
					$("#mahalle").append('<option value="' + value.id + '">' + value.mahalle + '</option>');
				});
			} else {
				alert('Mahalleler alınamadı!');
			}
		}
	});
});


$("form").submit(function (e) {
	console.log('form submited');
	e.preventDefault();
	$("#result").html('');
	$("form button").attr('disabled', 'disabled');

	var formData = {
		merkezno: $("#merkezno").val(),
		ziyaret: $("#ziyaret").val(),
		adi: $("#adi").val(),
		soyadi: $("#soyadi").val(),
		tel1: $("#tel1").val(),
		tel2: $("#tel2").val(),
		ilce: $("#ilce").val(),
		mahalle: $("#mahalle").val(),
		adres: $("#adres").val(),
		randevu: $("#randevu").val(),
		urungam: $("#urungam").val(),
		model: $("#model").val(),
		seri: $("#seri").val(),
		talep: $("#talep").val(),
		eknot: $("#eknot").val()
	};

	$.ajax({
		url: apiUrl + 'create.php',
		type: 'POST',
		data: JSON.stringify(formData),
		contentType: 'application/json',
		async: false, //blocks window close
	}).done(function (data) {
		if (data.hasOwnProperty('status') && data.hasOwnProperty('message')) {
			console.log('status ve message var');
			if (data.status) {
				divMain.innerHTML = '<div class="alert alert-success" role="alert"><h2 text-align="center">Oldu bu iş :)</h2></div> <b>' + merkezno + '</b> Merkez Nolu iş emri, <b>' + data.data.id + '</b> CRM numarası ile kayıt edildi...<br>';
				spanDurum.innerHTML = "> " + data.message;
				divMain.style.display = 'inline';
				divForm.style.display = 'none';
			} else {
				$("#result").html('Bir hata oluştu : ' + data.message);
			}

		} else {
			console.log('status ve/veya message YOK !');
			$("#result").html('Hay aksi! birşeyler ters gitti!');
			console.log(data);
		}
		$("form button").removeAttr("disabled");
	})
		.fail((err) => {
			$("#result").html('Eyvah! daha kötü bişiler oldu!');
			console.error(err);
			$("form button").removeAttr("disabled");
		})
	//.always(() => {console.log('always called');});
});
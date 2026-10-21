import xlsx from 'xlsx';
import path from 'path';

const rawData = `Amit Kumar	9216360099	amit95878@gmail.com	happylife@123	Astro Foundation Course old
Piyush Dubey	17063861239	piyushdubey86@gmail.com	happylife@123	Astro Foundation Course old
Dr Geetanjali Jha	7000209418	flower.heals@gmail.com	happylife@123	Astro Foundation Course old
Dr Shilpi Mohan	7298019042	shilpi2708@gmail.com	happylife@123	Astro Foundation Course old
Rupa Dutta	9671374163	rupadutta131@gmail.com	happylife@123	Astro Foundation Course old
Devinder Singh Sandhu	9779215060	uttam_iqbal@yahoo.co.in	happylife@123	Astro Foundation Course old
Paramjeet kaur sandhu	9820113120	paramjeetkkhokhar1@gmail.com	happylife@123	Astro Foundation Course old
Pooja Gajendra Shirke	7030400278	poojashirke530@gmail.com	happylife@123	Astro Foundation Course old
Ranjit Mithapelli	8983369654	ranjitmittapelli389@gmail.com	happylife@123	Astro Foundation Course old
Sandeep Sharma	9711209209	sandeep.rjcorp@gmail.com	happylife@123	Astro Foundation Course old
Kavita malavade	9321490507	kavitamalvade@yahoo.co.in	happylife@123	Astro Foundation Course old
Satish kumar	9810103204	satishchoottra51@gmail.com	happylife@123	Astro Foundation Course old
Retesh Gupta	9839009745	retesh.gupta1974@gmail.com	happylife@123	Astro Foundation Course old
Amishi Kapadia	9884220437	amishi.usa11@gmail.com	happylife@123	Astro Foundation Course old
Piyushha j Mehta	8884296806	piyushamehta13@gmail.com	happylife@123	Astro Foundation Course old
Hitesh Arora	4.47901E+11	hitesharora_75@yahoo.co.uk	happylife@123	Astro Foundation Course old
Vaid Prakash Sharma	9212025571	vpsengg357@gmail.com	happylife@123	Astro Foundation Course old
Upadhya Vishal	9377751942	vishal.mehta1942@gmail.com	happylife@123	Astro Foundation Course old
Anita Patil 	7972001812	patil.vasudeep@gmail.com	happylife@123	Astro Foundation Course old
Avinash Kumar Pillay	17025260460	avipillay83@gmail.com	happylife@123	Astro Foundation Course old
Indra Bhat	9769692569	indrakaul.bhat@gmail.com	happylife@123	Astro Foundation Course old
KUNAL PASRICHA	8218057806	kunalpasricha7@gmail.com	happylife@123	Astro Foundation Course old
Nimisha K Vekaria	4.40799E+12	nimisha.vekaria@sky.com	happylife@123	Astro Foundation Course old
Ashima Dhhingra	9818585552	ashimac1681@gmail.com	happylife@123	Astro Foundation Course old
Ajay Lakhani	9810438473	sapnaajbani@gmail.com	happylife@123	Astro Foundation Course old
Jatin kacha	9913739798	jnkacha@gmail.com	happylife@123	Astro Foundation Course old
F Saideep	8125189539	f.saideep89@gmail.com	happylife@123	Astro Foundation Course old
Sunita Tripathi	9717782020	sunitatrip76@gmail.com	happylife@123	Astro Foundation Course old
Mrs Rawat	8217386389	varsha.swastik9@gmail.com	happylife@123	Astro Foundation Course old
Vedendra Munipalli	9390102299	vedendra@gmail.com	happylife@123	Astro Foundation Course old
Chanchal gupta	8964990483	ramchanch02@gmail.com	happylife@123	Astro Foundation Course old
Shalaka Lolage	7620091633	shalaka.v.lolage@gmail.com	happylife@123	Astro Foundation Course old
Nikhil Agrawal	9935701035	consultantagrawal@gmail.com	happylife@123	Astro Foundation Course old
Naveen Kumar N	9880565194	nnk1220@gmail.com	happylife@123	Astro Foundation Course old
Deepika B Mannan	8567966196	deepikamannan9@gmail.com	happylife@123	Astro Foundation Course old
Hiren Trivedi	6353457232	trivedihiren96@gmail.com	happylife@123	Astro Foundation Course old
Soumitra Trivedi	9007097986	trivedisoumitra@yahoo.co.in	happylife@123	Astro Foundation Course old
mayank rohilla	7876239871	mayankrohilla143@gmail.com	happylife@123	Astro Foundation Course old
Abhishek p	9160079860	abhishekparauha@gmail.com	happylife@123	Astro Foundation Course old
Manoj Pandit	9924127853	aartipandit721@gmail.com	happylife@123	Astro Foundation Course old
Vishakha joshi	9826432142	vishakhajoshi03@gmail.com	happylife@123	Astro Foundation Course old
Suchitra kamble	9004400793	ksuchitra224@gmail.com	happylife@123	Astro Foundation Course old
Prajakta Upadhye	9226872799	mangalapraj@gmail.com	happylife@123	Astro Foundation Course old
Sharmee Biswas	9339235151	itsyourakshara@gmail.com	happylife@123	Astro Foundation Course old
Chetan Patel	16476248571	cstpm5055@gmail.com	happylife@123	Astro Foundation Course old
Sanjana Das	9319210512	sanjanadas.901@gmail.com	happylife@123	Astro Foundation Course old
Sonakshi Tiwari	9554222922	sonakshi.rbl@gmail.com	happylife@123	Astro Foundation Course old
Bhavna Arora	9811161242	bhavna.456.arora@gmail.com	happylife@123	Astro Foundation Course old
Dipin	9711663993	dipin24jan@gmail.com	happylife@123	Astro Foundation Course old
Madhuri Khanna	8585972897	madhuri1981@yahoo.com	happylife@123	Astro Foundation Course old
Saksham sharma	8368235294	sharma2957@gmail.com	happylife@123	Astro Foundation Course old
Ashish Thakkar	9535582690	anthakkar@hotmail.com	happylife@123	Astro Foundation Course old
manpreet sandhu	9852700000	meena_ghuman2001@yahoo.com	happylife@123	Astro Foundation Course old
Swapnil	9669909265	kashyapcind@gmail.com	happylife@123	Astro Foundation Course old
Nilesh Pillay	9820306338	nkpillay@hotmail.com	happylife@123	Astro Foundation Course old
Swetlima Chatterjee	9830178439	swetlima.kashyap@gmail.com	happylife@123	Astro Foundation Course old
Sanjay Kumar	9871736226	ussje2019@gmail.com	happylife@123	Astro Foundation Course old
Sonal Jadhav	9970034780	sonallsapkal2@gmail.com	happylife@123	Astro Foundation Course old
Truppti Chhipkar	9561665369	trushu83@gmail.com	happylife@123	Astro Foundation Course old
ARVIND PARMAR	9552501383	arvindparmar335566@gmail.com	happylife@123	Astro Foundation Course old
RANJEEV SHARMA	9780887821	ranjeev17@gmail.com	happylife@123	Astro Foundation Course old
Ashish Kukreja	8527713334	ashish.smiling@gmail.com	happylife@123	Astro Foundation Course old
Dimple	9958724652	dimplejhamb89@gmail.com	happylife@123	Astro Foundation Course old
Dishta Batish	7986246758	dishtabatish05@gmail.com	happylife@123	Astro Foundation Course old
Preeti mittu	9326737500	preetimittu@rediffmail.com	happylife@123	Astro Foundation Course old
Vimlesh Mattoo	6005770939	vimleshmattoo@yahoo.com	happylife@123	Astro Foundation Course old
Purnima Dass	9717069977	purnimadass@yahoo.com	happylife@123	Astro Foundation Course old
Jasvir Kaur	9588236867	yashbrar99@gmail.com	happylife@123	Astro Foundation Course old
Drishtti sahni	9868408153	drishttisahni12@gmail.com	happylife@123	Astro Foundation Course old
P.Pandey	8795558822	p.pandey2004@gmail.com	happylife@123	Astro Foundation Course old
S K Mahato	7219210514	skmahato014@gmail.com	happylife@123	Astro Foundation Course old
Vandana D	6598681465	vandhillon@gmail.com	happylife@123	Astro Foundation Course old
Deepak Sharma	9953773161	cs.deepaksharma9@gmail.com	happylife@123	Astro Foundation Course old
Sunil Patil	9637503752	sunilmadhavraopatil@gmail.com	happylife@123	Astro Foundation Course old
Anu Dutta	9711476564	anu.dutta.ad87@gmail.com	happylife@123	Astro Foundation Course old
Seema Dadlani	9643816063	seemaraju.dadlani@gmail.com	happylife@123	Astro Foundation Course old
Deepak saraswat	8299028448	dsaraswat1985@gmail.com	happylife@123	Astro Foundation Course old
Pankaj	9820413346	pankajratti@gmail.com	happylife@123	Astro Foundation Course old
Neelam	8607350085	neelamrathi78@gmail.com	happylife@123	Astro Foundation Course old
Shilpa Bhave	9823660133	bhaveshilpa@rediffmail.com	happylife@123	Astro Foundation Course old
Gaurav	9888800737	488gomes@gmail.com	happylife@123	Astro Foundation Course old
Divya Parwal	9001881610	divyaa.parwal@gmail.com	happylife@123	Astro Foundation Course old
Gunjan Bhardwaj	9212118541	gunjandec26@yahoo.co.in	happylife@123	Astro Foundation Course old
ragini srivastava	6307140851	09raginisrivastava@gmail.com	happylife@123	Astro Foundation Course old
Shruti Korukonda	9989545388	shrukorukonda@gmail.com	happylife@123	Astro Foundation Course old
Sarika	9899302001	sarika0629@gmail.com	happylife@123	Astro Foundation Course old
Sourav Jain	9463324084	jain.saurav96@gmail.com	happylife@123	Astro Foundation Course old
Sachin kr Sharma	9917370301	sachin.panchal@gmail.com	happylife@123	Astro Foundation Course old
Kirit Chauhan	9320028768	kiritc2017@gmail.com	happylife@123	Astro Foundation Course old
Maanan Bahl	8860633895	maananbahl@gmail.com	happylife@123	Astro Foundation Course old
Chandrashekhar Mehta	7020046306	chandramaa13@gmail.com	happylife@123	Astro Foundation Course old
Vikas Gupta	9829486635	vikasjigupta@gmail.com	happylife@123	Astro Foundation Course old
Anuja Kumar	9830540592	kumar.anuja@gmail.com	happylife@123	Astro Foundation Course old
Mitali Kelkar	9152112123	mitalikelkar2904@gmail.com	happylife@123	Astro Foundation Course old
Sonali Agarwal	9730847984	sonaliagarwal4777@gmail.com	happylife@123	Astro Foundation Course old
Shubham Pal	9165697993	palshubham089@outlook.com	happylife@123	Astro Foundation Course old
Gore	9175448562	innerlightwellness6@gmail.com	happylife@123	Astro Foundation Course old
Mrs Kailash Kanwar	8652753319	randomperpous@gmail.com	happylife@123	Astro Foundation Course old
mukesh kumar	8452047408	mukesh0112@gmail.com	happylife@123	Astro Foundation Course old
Rajneesh Bhatia	9205561578	sunmon1915@gmail.com	happylife@123	Astro Foundation Course old
Vatika Kapoor	7710131319	nirvanagal@gmail.com	happylife@123	Astro Foundation Course old
Nayan Jaiswal	8149722717	nayanjaiswalnj@gmail.com	happylife@123	Astro Foundation Course old
Prafulla Sinha	7992210710	prafullasinha72@gmail.com	happylife@123	Astro Foundation Course old
Ditiya dhalla	14375518433	ditiyadhalla@gmail.com	happylife@123	Astro Foundation Course old
Rahul Gopal Nagdev	7499086090	rahulnagdev777@gmail.com	happylife@123	Astro Foundation Course old
Amit bhatt	7417430802	amittbhatt@gmail.com	happylife@123	Astro Foundation Course old
Supriya Shetye	8805379618	supriyashetye73@gmail.com	happylife@123	Astro Foundation Course old
Ajay Bajaj	9435081543	ajoybajaj1@gmail.com	happylife@123	Astro Foundation Course old
Geeetanjali	7973792957	geetanajligrover79@gmail.com	happylife@123	Astro Foundation Course old
Parul garg	9027571595	parulperio09@gmail.com	happylife@123	Astro Foundation Course old
Naren Sharma	9414074704	narenanita@gmail.com	happylife@123	Astro Foundation Course old
Mr Sanjit Kuumar Ghosh	8484914345	sanjitkuumarghosh@gmail.com	happylife@123	Astro Foundation Course old
Prateek Goyal	9999399622	wingsplan@yahoo.co.in	happylife@123	Astro Foundation Course old
Archana	9830070563	archana108agarwal@gmail.com	happylife@123	Astro Foundation Course old
Santosh Sharma	9465130303	santoshdixit63@gmail.com	happylife@123	Astro Foundation Course old
Prasansha Shringarpure	9892264250	prasansha.earthcare@gmail.com	happylife@123	Astro Foundation Course old
Raj	12012759447	dev101dabang@gmail.com	happylife@123	Astro Foundation Course old
Sunita Baheti	9830109770	sunita_baheti@yahoo.co.in	happylife@123	Astro Foundation Course old
Nandkumar Gaikkwad	9890939062	ceo@evolvext.com	happylife@123	Astro Foundation Course old
Prabha Sharma	9718413439	prabhasunshine@gmail.com	happylife@123	Astro Foundation Course old
Sandeep Saxena	9897463867	sandeepsaxenambd2@gmail.com	happylife@123	Astro Foundation Course old
Girish agarwal	9414033732	cagirishagarwal@gmail.com	happylife@123	Astro Foundation Course old
Sharmila Mukhopadhyay	6596828386	sharmila1213@gmail.com	happylife@123	Astro Foundation Course old
Rajani Preman	9920269409	rejju09@gmail.com	happylife@123	Astro Foundation Course old
MUKUL SHARMA	9837832409	mukul76sharma@gmail.com	happylife@123	Astro Foundation Course old
Madhavi Lata Aenugula	9290582290	madhavilatalaw1803@gmail.com	happylife@123	Astro Foundation Course old
Amit Rajdev	7383992812	rajdev.iimk@gmail.com	happylife@123	Astro Foundation Course old
Shraddha sharma	7858059045	suchisuchi1230@gmail.com	happylife@123	Astro Foundation Course old
Vandana Kapur	9582756353	kapoorvandana1980@gmail.com	happylife@123	Astro Foundation Course old
Mayank Narang	9971057132	mayank_narang@yahoo.co.in	happylife@123	Astro Foundation Course old
Rohit	8390871944	rohit1388@gmail.com	happylife@123	Astro Foundation Course old
Priya Ghosh	8910035813	ghoshpriya845@gmail.com	happylife@123	Astro Foundation Course old
Komal Sharma	19253342018	ksharma.gne@gmail.com	happylife@123	Astro Foundation Course old
Divyanshu Tomar	7895258110	divyanshutomar27@gmail.com	happylife@123	Astro Foundation Course old
Lingaraja Reddy	8327743449	lingarajareddy@gmail.com	happylife@123	Astro Foundation Course old`;

const lines = rawData.trim().split('\n').filter(Boolean);
const rows = [['Name', 'Phone', 'Email', 'Password', 'Course']];

for (const line of lines) {
  const parts = line.split('\t').map(s => s.trim());
  if (parts.length >= 5) {
    let phone = parts[1];
    if (phone.toLowerCase().includes('e+')) {
      const num = Number(phone);
      if (!isNaN(num)) phone = BigInt(Math.round(num)).toString();
    }
    rows.push([parts[0], phone, parts[2], parts[3], parts[4]]);
  }
}

const ws = xlsx.utils.aoa_to_sheet(rows);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Students');
const targetPath = path.resolve('../students_astro_foundation_old.xlsx');
xlsx.writeFile(wb, targetPath);
console.log(`Saved ${rows.length - 1} student rows to ${targetPath}`);

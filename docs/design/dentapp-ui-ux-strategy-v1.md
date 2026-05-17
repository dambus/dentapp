# DentApp UI/UX Strategy v1

## 0. Svrha dokumenta

Ovaj dokument je radni dogovor između tri zamišljene uloge:

- **iskusni app tester** — gleda stabilnost toka, greške, edge case-ove i ručno testiranje;
- **iskusni UI/UX dizajner** — gleda organizaciju informacija, tokove rada, mobilni/desktop UX i mentalni model korisnika;
- **iskusni grafički dizajner** — gleda vizuelnu hijerarhiju, tipografiju, ikonografiju, boje, ritam ekrana i moderan karakter aplikacije.

Cilj nije da DentApp izgleda futuristički ili eksperimentalno. Cilj je da izgleda kao moderna, ozbiljna, intuitivna klinička aplikacija: jasna, brza, pouzdana i dovoljno vizuelno bogata da korisnik ne mora stalno da čita dugačke tekstove da bi znao šta da uradi.

---

## 1. Glavni zaključak tima

Trenutni DentApp je funkcionalno sve zreliji, ali UX sada počinje da pokazuje tipične simptome aplikacije koja je brzo rasla:

- ekrani postaju dugi;
- ima previše teksta;
- akcije su često direktno izložene kao više dugmadi;
- mobilni prikaz zahteva previše skrolovanja;
- raspored termina ne podržava mentalni model ordinacije;
- pacijent detalj stranica preti da postane “sve na jednoj stranici”;
- ikonografija i vizuelni signali nisu dovoljno korišćeni;
- tab navigacija na mobilnom nije dovoljno otkriva i nije dovoljno operativna;
- appointment, treatment plan, odontogram i visit workflow moraju se pažljivo povezati, ali bez pravljenja jedne pretrpane stranice.

**Strategija:** DentApp treba da pređe iz “tekstualnih kartica i dugmadi” u **operativni klinički workspace**: jasni pregledi, vizuelni raspored, kratke akcije, smisleni statusi, ikonice sa labelama, kontekstualni paneli i progressive disclosure.

---

## 2. Dizajn principi za DentApp

### 2.1. Prvo vreme, zatim pacijent, zatim akcija

Za appointment modul najvažniji objekat nije kartica termina nego **vreme**.

Doktor/asistent ne razmišlja: “imam listu appointment record-a”, nego:

- kada je slobodan termin;
- ko dolazi;
- šta se radi;
- koliko traje;
- ko je lekar;
- da li je termin težak/lak;
- da li treba pripremiti materijal/opremu;
- da li postoji alternativa kod drugog lekara.

Zato `/appointments` ne treba da ostane obična lista. Lista je korisna za MVP, ali prirodni oblik je **day/week schedule grid**.

### 2.2. Smanjiti čitanje, povećati prepoznavanje

Korisnik ne treba za svaku karticu da pročita 6 rečenica. Treba da vidi:

- vreme velikim fontom;
- ime pacijenta jasno;
- tip termina kao badge/pill;
- lekar kao boja/avatar/inicijal;
- status kao boja i tekst;
- najvažnija akcija direktno;
- sekundarne akcije u meniju.

### 2.3. Ikonice nisu dekoracija nego orijentiri

Treba uvesti konzistentan icon pack, najverovatnije **Heroicons** ili **Lucide**. Pošto React ekosistem često koristi Lucide i već postoji dobar set medicinski-neutralnih ikonica, Lucide je vrlo praktičan izbor. Heroicons je takođe dobar, ali Lucide ima širi set za app UI.

Pravilo: za kritične akcije ikonice treba kombinovati sa tekstom, posebno dok korisnici uče aplikaciju. Icon-only dugmad su prihvatljiva samo za sekundarne akcije uz tooltip/aria-label i kada je značenje standardno.

### 2.4. Akcije moraju imati hijerarhiju

Na terminima i pacijent karticama ne sme sve da bude dugme istog ranga. Predlog:

- **primary action:** najverovatnija sledeća akcija, npr. `Start visit` za scheduled termin;
- **secondary action:** `Details`, `Open patient`;
- **overflow menu:** `Cancel`, `No-show`, `Mark completed`, ostale status promene.

Time se smanjuje vizuelna buka i broj dugmadi po kartici.

### 2.5. Mobilni nije samo “desktop kartice u jednoj koloni”

Mobilni workflow treba posebno projektovati:

- sticky workflow header za Visit Completion;
- bottom action bar za ključne akcije;
- dropdown/section switcher umesto horizontalnih tabova koji kriju opcije;
- schedule prikaz kao vertikalni timeline za dan, a ne širok grid;
- week prikaz kao “day strips” ili lista dana, ne desktop kalendar.

### 2.6. Patient detail mora postati dashboard, ne dokument od 20 sekcija

Kako raste broj modula, patient detail ne sme postati beskonačna strana. Treba ga organizovati kao:

1. **Patient header** — identitet, alerti, ključne akcije;
2. **Today / Next panel** — sledeći termin, pending follow-up, active treatment;
3. **Clinical workspace sections** — timeline, odontogram, treatment plan, visits, appointments;
4. **Contextual panels** — ne prikazivati sve odjednom.

---

## 3. Appointment modul — predloženi ciljni UX

### 3.1. `/appointments` mora evoluirati u Schedule workspace

Trenutni `/appointments` kao lista nije dovoljno pregledan kada ima više termina i više doktora. Ciljni oblik:

#### Desktop/tablet landscape

- **Top bar:** date controls, Day / Week switch, doctor filter, appointment type filter, quick add.
- **Main area:** schedule grid ili grouped timeline.
- **Right side panel:** selected appointment detail / quick create / available slots.

#### Mobile

- **Top sticky controls:** selected day/week, filter button, add button.
- **Vertical time agenda:** termini grupisani po vremenu.
- **Doctor/type badges:** kompaktni vizuelni signali.
- **Bottom sheet:** details / actions / create appointment.

### 3.2. Day view — prioritet za sledeću iteraciju

Day view treba da bude operativni prikaz ordinacije.

**Desktop koncept:**

```text
┌───────────────────────────────────────────────────────────────┐
│ Appointments     Today  < 18 May 2026 >   Day | Week   + New  │
├────────┬───────────────┬───────────────┬───────────────┬──────┤
│ Time   │ Dr Ana        │ Dr Marko      │ Dr Jelena     │ ...  │
├────────┼───────────────┼───────────────┼───────────────┼──────┤
│ 09:00  │ [Consultation]│               │ [Extraction]  │      │
│ 09:15  │ [Consultation]│ [Control]     │ [Extraction]  │      │
│ 09:30  │               │ [Filling]     │               │      │
│ 09:45  │ [Free]        │ [Filling]     │ [Free]        │      │
└────────┴───────────────┴───────────────┴───────────────┴──────┘
```

Ako je više doktora, kolone po doktoru su prirodnije od čiste liste. Ako je ordinacija mala, mogu se sakriti doktori bez termina ili prikazati filter.

**Važno:** korisnik treba da vidi “rupe” u rasporedu. To je najveća razlika između liste i pravog zakazivača.

### 3.3. Week view — ne pun kalendar, nego sedmični pregled kapaciteta

Week view ne mora odmah biti drag/drop calendar. Prva korisna verzija:

- kolone po danima;
- kartice termina unutar dana;
- broj termina i opterećenje po danu;
- filters by doctor/status/type.

Na mobilnom: sedmica kao lista dana sa collapsible sekcijama.

### 3.4. Appointment type mora postati first-class podatak

Trenutno reason/notes nisu dovoljni. Ordinaciji treba standardizovan tip termina:

- First exam / prvi pregled;
- Control / kontrola;
- Extraction / vađenje;
- Filling / plomba;
- Endodontics;
- Prosthetics;
- Hygiene;
- Emergency;
- Other.

Svaki tip treba imati:

- label;
- default duration u 15-min blokovima;
- boju ili semantički token;
- optional icon;
- možda required preparation hint kasnije.

Ovo će direktno rešiti tvoju opservaciju da doktor želi brzo da vidi kakav dan ga čeka: “dva prva pregleda i jedno vađenje”.

### 3.5. Trajanje termina mora biti u 15-min intervalima

Umesto slobodnog trajanja, UI treba da koristi:

- 15 min;
- 30 min;
- 45 min;
- 60 min;
- 90 min;
- custom kasnije ako treba.

U schedule grid-u svaki blok je 15 min. Appointment span vizuelno zauzima 1, 2, 3 ili više blokova.

### 3.6. Multi-doctor flow

Mora se podržati realan scenario:

> Doktor A nema slobodan termin, asistent vidi da doktor B ima rupu i zakazuje pacijenta kod njega.

Za to su potrebni:

- doctor/provider field na appointment modelu;
- filter “All doctors / My schedule / Doctor X”;
- permission: neki korisnici mogu videti sve termine, ali menjati samo svoje ili po roli;
- vizuelni signal doktora: boja, inicijali, avatar, mala vertikalna traka na kartici.

Trenutno ne treba odmah implementirati kompleksne rolske restrikcije, ali UX mora biti projektovan kao da će doći.

---

## 4. Appointment kartica — predlog nove hijerarhije

Trenutno termin ima previše dugmadi. Predlog:

```text
┌────────────────────────────────────────┐
│ 11:00–11:30        Scheduled       ⋯   │
│ Milan Petrović                         │
│ Consultation     Dr Ana     30 min     │
│ Note preview if important...           │
│                                        │
│ [Start visit]              [Details]   │
└────────────────────────────────────────┘
```

Za non-scheduled:

```text
┌────────────────────────────────────────┐
│ 11:00–11:30        Completed       ⋯   │
│ Milan Petrović                         │
│ Extraction      Dr Marko     45 min    │
│ [View visit]              [Details]    │
└────────────────────────────────────────┘
```

### Akcije

- `Start visit` samo za scheduled.
- `Details` uvek dostupan.
- `Open patient` može biti u overflow meniju ili kao klik na ime pacijenta.
- `Cancel / No-show / Complete` u overflow meniju, ne stalno kao tri dugmeta.

---

## 5. Patient detail — predlog strukture

### 5.1. Header

Na vrhu treba da postoji compact patient header:

- ime;
- godine / datum rođenja;
- kontakt;
- status/alert badges;
- primarni quick action;
- overflow quick actions.

Predlog quick actions:

- `Start visit`;
- `Schedule`;
- `Add note`;
- `More` dropdown.

Ne treba sva dugmad stalno prikazivati.

### 5.2. Mobile section navigation

Horizontalni scroll tabovi nisu idealni jer korisnik ne zna da postoje opcije van viewport-a. Predlog:

- desktop: tabs ili sidebar unutar patient detail-a;
- tablet: segmented + more;
- mobile: **section dropdown** ili sticky “Record section” selector.

Primer mobile:

```text
[ Patient: Milan Petrović                ]
[ Section: Timeline                  v   ]
```

Korisnik jasno vidi da je to selector, a ne skriven horizontalni sadržaj.

### 5.3. Patient detail ne treba da prikazuje sve module odjednom

Kako dolaze odontogram, treatment plan, billing, attachments, appointments, visits — sve mora biti section-driven.

Predlog glavnih sekcija:

- Overview;
- Timeline;
- Visits;
- Appointments;
- Treatment plan;
- Odontogram;
- Documents.

Na mobile default treba da bude Overview ili Today, sa jasnim selectorom.

---

## 6. Visit Completion — mobile workflow pravila

Problem: sticky stepper/progress više nije uvek vidljiv. To direktno pogađa orijentaciju korisnika.

Predlog:

### Mobile sticky workflow header

Na vrhu Visit Completion route-a, ispod app topbar-a ili kao deo workflow ekrana:

```text
Visit Completion
Step 2 of 4 · Procedures
[██████░░░░]
```

Mora ostati sticky tokom skrola.

### Bottom action bar

Na mobilnom:

```text
[Back]                 [Next]
```

ili na final step:

```text
[Save draft]       [Complete]
```

Tako korisnik ne mora stalno da skroluje na dno/vrh.

---

## 7. Odontogram + Treatment Plan + Appointment veza

Tvoja intuicija je tačna: appointment scheduling ne treba da bude potpuno izolovan. U stomatološkom workflow-u zakazivanje često dolazi iz:

- treatment plan-a;
- aktivne dijagnoze;
- odontograma;
- preporuke iz prethodne posete;
- follow-up next step-a.

Ciljna logika:

1. Iz Treatment Plan item-a korisnik može kliknuti `Schedule`.
2. Appointment type/reason se prefill-uje iz planirane procedure.
3. Ako procedura ima recommended duration, trajanje se prefill-uje.
4. U schedule UI-u korisnik bira prvi slobodan slot.
5. Appointment se linkuje nazad na treatment plan item.
6. Kada se Visit Completion završi, može se označiti deo plana kao completed/progress.

Ne treba ovo odmah implementirati, ali treba ga uzeti kao buduću arhitekturu. Zato appointment model treba kasnije podržati `appointment_type`, `provider_id`, možda `treatment_plan_item_id`.

---

## 8. Visual design direction

### 8.1. Moderno, ali ne modno

DentApp treba da izbegne oba ekstrema:

- starinski admin panel iz 2018. sa sivim tabelama i mnogo teksta;
- previše “dribbble” dizajn sa previše efekata, gradienta i nerealnim karticama.

Predlog: **clean clinical workspace**.

Karakter:

- svetla pozadina;
- neutralne površine;
- jedna primarna medicinska boja;
- status boje strogo semantičke;
- blage senke;
- jasni borderi;
- veće razlike u tipografiji;
- ikonice kao orijentiri;
- badges/pills za tipove/status.

### 8.2. Tipografija

Trenutno treba više kontrasta u veličinama.

Predlog skale:

- Page title: 24–28 px desktop, 20–22 px mobile;
- Section title: 18–20 px;
- Card title / patient name: 16–18 px, semibold;
- Appointment time: 18–22 px, bold/semibold;
- Metadata: 12–13 px;
- Helper text: 12–13 px, muted.

Pravilo: vreme i pacijent u appointment UI-u moraju biti najveći elementi kartice.

### 8.3. Boje

Boje treba koristiti funkcionalno.

Status:

- Scheduled: plava ili neutralno-plava;
- Completed: zelena;
- Cancelled: siva/crvena muted;
- No-show: narandžasta;
- Urgent/Emergency: crvena;
- Follow-up: ljubičasta/plava.

Doktori:

- doktor boja ne sme se mešati sa status bojama;
- koristiti malu vertikalnu traku, avatar ili inicijale;
- ne praviti ceo appointment card u boji doktora.

Appointment type:

- može imati pill sa ikonicom;
- boje blage, ne agresivne.

### 8.4. Ikonografija

Predlog: uvesti jedan pack i pravila.

Mogući izbor:

- **Lucide React** — veoma dobar za app UI, tanak line style, veliki set;
- **Heroicons** — vrlo kvalitetan, ali manji set;
- **Tabler Icons** — dobar za dashboards, ali može delovati malo tehnički.

Preporuka tima: **Lucide React**, osim ako projekat već koristi Heroicons ili postoji jak razlog za drugo.

Pravila:

- primarne akcije: ikonica + label;
- sekundarne akcije: label ili icon + label;
- overflow/toolbar: icon-only uz tooltip/aria-label;
- ne koristiti ikonicu pored svakog teksta bez potrebe.

---

## 9. Prioriteti za sledeće implementacione taskove

### Task D1 — Design System Icon & Action Pattern

Cilj: uvesti ikonice i standardizovati akcije.

Deliverables:

- izabrati icon pack;
- napraviti `IconButton`, `ActionMenu`, `StatusBadge`, `TypeBadge` ako ne postoje;
- pravila za primary/secondary/overflow akcije;
- refactor appointment cards da smanje broj stalno vidljivih dugmadi.

### Task D2 — Appointment Card Redesign

Cilj: appointment kartice postaju preglednije.

Deliverables:

- vreme i pacijent kao glavna hijerarhija;
- status badge;
- appointment type badge;
- doctor marker placeholder;
- Details + primary action;
- ostalo u overflow.

### Task D3 — Appointment Type & Duration Standardization

Cilj: standardizovati tip i trajanje termina.

Deliverables:

- appointment type constants;
- default durations;
- duration choices u 15-min blokovima;
- UI prefill iz type-a;
- badges po tipu.

Može zahtevati migraciju ako appointment_type ide u bazu.

### Task D4 — Schedule Day View v1

Cilj: `/appointments` prestaje da bude samo lista; dobija dnevni schedule/timeline.

Deliverables:

- day timeline sa 15-min slotovima;
- mobile vertical agenda;
- desktop grouped by doctor ako provider field postoji, ili single-column time agenda dok se provider ne uvede;
- free slot visibility;
- create appointment iz schedule context-a.

### Task D5 — Patient Detail Mobile Navigation Redesign

Cilj: zameniti horizontal-scroll tabs na mobile.

Deliverables:

- section dropdown ili bottom-sheet section selector;
- sticky section selector;
- očuvati desktop tab behavior;
- smanjiti scrolling confusion.

### Task D6 — Visit Completion Mobile Sticky Progress

Cilj: korisnik uvek zna gde je u flow-u.

Deliverables:

- sticky mobile workflow header;
- compact progress;
- bottom action bar;
- bez razbijanja desktop stepper-a.

### Task D7 — Patient Overview IA Refactor

Cilj: patient detail postaje dashboard, ne beskonačna strana.

Deliverables:

- top quick actions sa overflow;
- Today/Next panel;
- jasna sekcija za appointments/follow-up/treatment plan;
- ne prikazivati sve module odjednom.

---

## 10. Šta ne treba raditi odmah

Tim ne preporučuje odmah:

- full calendar sa drag/drop-om;
- kompletan redesign cele aplikacije;
- provider/chair scheduling bez prethodnog modela;
- treatment plan integraciju pre jasnog modela;
- icon-only navigaciju bez labela;
- horizontalni weekly grid na mobilnom;
- bojenje celih ekrana i kartica jakim bojama;
- dodavanje još više tekstualnih objašnjenja.

---

## 11. Preporučeni sledeći potez

Pre novih funkcionalnosti, tim predlaže sledeći redosled:

1. **D1 — Design System Icon & Action Pattern**
2. **D2 — Appointment Card Redesign**
3. **D3 — Appointment Type & Duration Standardization**
4. **D5 — Patient Detail Mobile Navigation Redesign**
5. **D6 — Visit Completion Mobile Sticky Progress**
6. Tek zatim **D4 — Schedule Day View v1** ako imamo dovoljno stabilan appointment type/provider koncept.

Ako želiš brži vidljiv rezultat za appointment modul, može se zameniti redosled:

1. D1
2. D2
3. D4 basic single-provider day timeline
4. D3
5. multi-doctor extension kasnije

Ali tim smatra da je bolje prvo definisati akcije, tipove i hijerarhiju kartice, jer će schedule view u suprotnom samo prikazati loše kartice u novom rasporedu.

---

## 12. Sažetak odluke

DentApp treba da ide ka modernom, klinički jasnom workspace-u:

- manje teksta;
- jasnije hijerarhije;
- ikonice kao pomoć, ne ukras;
- appointment type + status badges;
- standardizovani 15-min slotovi;
- schedule view koji pokazuje slobodne rupe;
- mobile UX posebno projektovan, ne samo responzivno sabijen;
- patient detail kao dashboard sa sekcijama;
- treatment plan / odontogram / appointments treba postepeno povezati.

Prvi praktičan dizajn korak treba da bude standardizacija action pattern-a i appointment card redesign, jer to donosi vidljivo poboljšanje bez velike promene baze ili arhitekture.

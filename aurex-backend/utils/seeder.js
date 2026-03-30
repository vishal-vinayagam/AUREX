/**
 * Seed Laws - AUREX Civic Issue Reporting System
 *
 * Usage: node utils/seeder.js
 */
require('dotenv').config();
const connectDB = require('../config/database');
const Law = require('../models/Law');
const User = require('../models/User');

const lawsSeed = [
  {
    title: 'Right to Information Act',
    actNumber: '22 of 2005',
    year: 2005,
    category: 'civic_rights',
    description: 'Gives citizens the right to request information from public authorities within set timelines.',
    summary: 'RTI empowers citizens to seek government records and improves transparency.',
    content:
      'The Right to Information Act, 2005 allows any citizen to ask for information from government departments and public authorities. Officials must respond within timelines and can refuse only for limited exemptions. It helps reduce corruption and improves accountability.',
    keyPoints: ['Citizens can file RTI requests', 'Time-bound responses', 'Limited exemptions'],
    isFeatured: true
  },
  {
    title: 'Consumer Protection Act',
    actNumber: '35 of 2019',
    year: 2019,
    category: 'consumer_protection',
    description: 'Protects consumers against unfair trade practices and provides redressal forums.',
    summary: 'Creates consumer courts and strengthens product and service accountability.',
    content:
      'The Consumer Protection Act, 2019 safeguards consumer rights and establishes commissions for dispute resolution. It covers goods, services, and e-commerce, and allows complaints against defective products or deficient services. The law also addresses misleading advertisements.',
    keyPoints: ['Consumer rights protection', 'Dedicated redressal commissions', 'Covers e-commerce'],
    isFeatured: true
  },
  {
    title: 'Information Technology Act',
    actNumber: '21 of 2000',
    year: 2000,
    category: 'public_safety',
    description: 'Provides legal recognition for electronic transactions and addresses cyber offences.',
    summary: 'Governs digital signatures, online transactions, and cybercrime penalties.',
    content:
      'The Information Technology Act, 2000 provides legal status to digital records and signatures. It also defines cyber offences such as hacking, identity theft, and data breaches. The Act supports safe digital commerce and cybersecurity enforcement.',
    keyPoints: ['Legal recognition of e-records', 'Cybercrime definitions', 'Penalties for offences']
  },
  {
    title: 'Motor Vehicles Act',
    actNumber: '59 of 1988',
    year: 1988,
    category: 'traffic_rules',
    description: 'Regulates road transport, licensing, vehicle registration, and traffic safety.',
    summary: 'Sets rules for drivers, vehicles, and road safety compliance.',
    content:
      'The Motor Vehicles Act, 1988 governs vehicle registration, driving licenses, and road safety rules. It specifies traffic offences and penalties and mandates insurance and fitness requirements. Amendments strengthen road safety and liability.',
    keyPoints: ['Licensing and registration', 'Traffic offence penalties', 'Road safety rules'],
    isFeatured: true
  },
  {
    title: 'Protection of Women from Domestic Violence Act',
    actNumber: '43 of 2005',
    year: 2005,
    category: 'public_safety',
    description: 'Provides civil remedies and protection orders for women facing domestic violence.',
    summary: 'Allows protection orders, residence rights, and support services.',
    content:
      'The Domestic Violence Act, 2005 protects women from physical, emotional, and economic abuse. It allows courts to issue protection and residence orders and provides support through protection officers. It applies to domestic relationships.',
    keyPoints: ['Protection orders', 'Right to residence', 'Support services'],
    isFeatured: true
  },
  {
    title: 'Child and Adolescent Labour (Prohibition and Regulation) Act',
    actNumber: '61 of 1986',
    year: 1986,
    category: 'employment',
    description: 'Prohibits child labour and regulates adolescent working conditions.',
    summary: 'Bans child labour in hazardous work and sets safeguards for adolescents.',
    content:
      'The Child Labour Act, 1986 prohibits employment of children in hazardous occupations. It also regulates working conditions for adolescents and prescribes penalties for violations. The aim is to protect children and promote education.',
    keyPoints: ['Ban on child labour in hazardous work', 'Regulated hours for adolescents', 'Penalties for violations']
  },
  {
    title: 'Right of Children to Free and Compulsory Education Act',
    actNumber: '35 of 2009',
    year: 2009,
    category: 'education',
    description: 'Guarantees free and compulsory education for children aged 6 to 14 years.',
    summary: 'Makes elementary education a legal right and sets school standards.',
    content:
      'The RTE Act, 2009 ensures free and compulsory education for all children aged 6-14. It mandates minimum standards for schools and reserves seats for disadvantaged groups. It also prohibits capitation fees and screening tests.',
    keyPoints: ['Free education 6-14 years', 'School standards', 'Reserved seats for disadvantaged'],
    isFeatured: true
  },
  {
    title: 'Indian Penal Code',
    actNumber: '45 of 1860',
    year: 1860,
    category: 'public_safety',
    description: 'Defines criminal offences and penalties in India.',
    summary: 'Core criminal law covering offences from theft to serious crimes.',
    content:
      'The Indian Penal Code, 1860 lists criminal offences and corresponding punishments. It covers crimes against persons, property, and the state. It is a foundational criminal law used across the country.',
    keyPoints: ['Defines criminal offences', 'Specifies punishments', 'Applies nationwide'],
    isFeatured: true
  },
  {
    title: 'Code of Criminal Procedure',
    actNumber: '2 of 1974',
    year: 1974,
    category: 'public_safety',
    description: 'Provides procedures for investigation, trial, and bail in criminal cases.',
    summary: 'Sets rules for police, courts, and criminal case process.',
    content:
      'The CrPC, 1974 lays down procedures for arrest, investigation, prosecution, and trial. It also defines bail, summons, and appeal processes. It ensures due process in criminal justice.',
    keyPoints: ['Investigation and trial procedures', 'Bail and custody rules', 'Due process safeguards']
  },
  {
    title: 'Environment Protection Act',
    actNumber: '29 of 1986',
    year: 1986,
    category: 'environment',
    description: 'Provides broad powers to protect and improve the environment.',
    summary: 'Enables standards, rules, and penalties for environmental protection.',
    content:
      'The Environment Protection Act, 1986 empowers the government to set environmental standards and control pollution. It covers air, water, and land protection and provides penalties for violations. It supports sustainable development.',
    keyPoints: ['Environmental standards', 'Pollution control', 'Penalties for violations'],
    isFeatured: true
  },
  {
    title: 'Indian Contract Act',
    actNumber: '9 of 1872',
    year: 1872,
    category: 'other',
    description: 'Defines rules for valid contracts and obligations.',
    summary: 'Sets the basic law on agreements and enforceable contracts.',
    content:
      'The Indian Contract Act, 1872 explains how contracts are formed and enforced. It covers offer, acceptance, consideration, and breach. It also includes rules for indemnity, guarantee, and agency.',
    keyPoints: ['Valid contract essentials', 'Breach and remedies', 'Indemnity and guarantee']
  },
  {
    title: 'Minimum Wages Act',
    actNumber: '11 of 1948',
    year: 1948,
    category: 'employment',
    description: 'Ensures minimum wages for workers in specified employment.',
    summary: 'Protects workers from exploitation through wage floors.',
    content:
      'The Minimum Wages Act, 1948 empowers governments to fix minimum wage rates in scheduled employments. It protects workers from underpayment and mandates timely wage payment. Violations attract penalties.',
    keyPoints: ['Minimum wage floors', 'Scheduled employments', 'Penalties for violations']
  },
  {
    title: 'Payment of Wages Act',
    actNumber: '4 of 1936',
    year: 1936,
    category: 'employment',
    description: 'Regulates timely payment of wages and permissible deductions.',
    summary: 'Ensures workers receive wages on time and without unfair cuts.',
    content:
      'The Payment of Wages Act, 1936 sets timelines for wage payments and limits deductions. It applies to certain wage thresholds and aims to prevent delays and arbitrary deductions.',
    keyPoints: ['Timely wage payments', 'Limits on deductions', 'Worker protection']
  },
  {
    title: 'Employees Provident Funds and Miscellaneous Provisions Act',
    actNumber: '19 of 1952',
    year: 1952,
    category: 'employment',
    description: 'Provides social security through provident fund, pension, and insurance.',
    summary: 'Creates EPF, EPS, and EDLI benefits for employees.',
    content:
      'The EPF Act, 1952 mandates provident fund contributions for eligible employees. It supports retirement savings, pension benefits, and insurance coverage. Employers must deposit contributions regularly.',
    keyPoints: ['Provident fund savings', 'Pension benefits', 'Employer compliance']
  },
  {
    title: 'Legal Services Authorities Act',
    actNumber: '39 of 1987',
    year: 1987,
    category: 'civic_rights',
    description: 'Provides free legal aid to eligible citizens.',
    summary: 'Ensures access to justice through legal aid services.',
    content:
      'The Legal Services Authorities Act, 1987 establishes legal aid authorities to provide free legal services. It helps women, children, and disadvantaged groups access justice. Lok Adalats are also promoted under this law.',
    keyPoints: ['Free legal aid', 'Lok Adalats', 'Support for disadvantaged']
  },
  {
    title: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act',
    actNumber: '14 of 2013',
    year: 2013,
    category: 'employment',
    description: 'Prevents sexual harassment at workplaces and provides complaint mechanisms.',
    summary: 'Mandates internal committees and safe workplace policies.',
    content:
      'The POSH Act, 2013 requires employers to create internal complaint committees and a safe workplace. It defines sexual harassment and outlines inquiry procedures. Non-compliance attracts penalties.',
    keyPoints: ['Internal complaint committees', 'Safe workplace policies', 'Defined inquiry process']
  },
  {
    title: 'Juvenile Justice (Care and Protection of Children) Act',
    actNumber: '2 of 2016',
    year: 2015,
    category: 'public_safety',
    description: 'Provides care and protection for children in conflict with law and in need.',
    summary: 'Focuses on rehabilitation and child welfare procedures.',
    content:
      'The Juvenile Justice Act, 2015 sets procedures for children in conflict with law and those needing care and protection. It focuses on rehabilitation, adoption, and child-friendly justice mechanisms.',
    keyPoints: ['Child-friendly justice', 'Rehabilitation focus', 'Care and protection']
  },
  {
    title: 'Protection of Children from Sexual Offences Act',
    actNumber: '32 of 2012',
    year: 2012,
    category: 'public_safety',
    description: 'Protects children from sexual offences with special courts and procedures.',
    summary: 'Defines offences and ensures child-friendly trial processes.',
    content:
      'The POCSO Act, 2012 defines sexual offences against children and provides special courts for speedy trials. It mandates child-friendly procedures for reporting and testimony. It imposes strict penalties.',
    keyPoints: ['Special courts', 'Child-friendly procedures', 'Strict penalties']
  },
  {
    title: 'Dowry Prohibition Act',
    actNumber: '28 of 1961',
    year: 1961,
    category: 'public_safety',
    description: 'Prohibits giving or taking dowry in marriage.',
    summary: 'Criminalizes dowry demands and related offences.',
    content:
      'The Dowry Prohibition Act, 1961 makes demanding, giving, or taking dowry a criminal offence. It aims to protect women from dowry-related harassment and violence.',
    keyPoints: ['Dowry demand is illegal', 'Criminal penalties', 'Protects women']
  },
  {
    title: 'Maintenance and Welfare of Parents and Senior Citizens Act',
    actNumber: '56 of 2007',
    year: 2007,
    category: 'civic_rights',
    description: 'Provides maintenance rights for parents and senior citizens.',
    summary: 'Allows seniors to claim support and protection.',
    content:
      'This Act, 2007 allows parents and senior citizens to claim maintenance from children or relatives. It also provides for old-age home provisions and protection of life and property.',
    keyPoints: ['Maintenance rights', 'Senior citizen protection', 'Property safeguards']
  },
  {
    title: 'National Food Security Act',
    actNumber: '20 of 2013',
    year: 2013,
    category: 'civic_rights',
    description: 'Provides legal entitlement to subsidized food grains.',
    summary: 'Strengthens public distribution and nutrition support.',
    content:
      'The NFSA, 2013 entitles eligible households to subsidized food grains through the public distribution system. It also covers nutritional support for children and pregnant women.',
    keyPoints: ['Subsidized food grains', 'Nutrition for vulnerable groups', 'PDS strengthening']
  },
  {
    title: 'Aadhaar Act',
    actNumber: '18 of 2016',
    year: 2016,
    category: 'civic_rights',
    description: 'Provides legal framework for Aadhaar identity and authentication.',
    summary: 'Regulates collection and use of Aadhaar data.',
    content:
      'The Aadhaar Act, 2016 establishes the Unique Identification Authority of India and governs Aadhaar enrolment and authentication. It includes rules for data protection and permitted uses.',
    keyPoints: ['UIDAI framework', 'Authentication rules', 'Data protection provisions']
  },
  {
    title: 'Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act',
    actNumber: '33 of 1989',
    year: 1989,
    category: 'public_safety',
    description: 'Prevents atrocities against SC/ST communities and provides special courts.',
    summary: 'Ensures protection and speedy justice for vulnerable communities.',
    content:
      'The SC/ST Act, 1989 defines offences against SC/ST persons and sets up special courts. It aims to prevent discrimination, violence, and social oppression.',
    keyPoints: ['Defined offences', 'Special courts', 'Victim protection']
  },
  {
    title: 'Right to Fair Compensation and Transparency in Land Acquisition Act',
    actNumber: '30 of 2013',
    year: 2013,
    category: 'municipal_laws',
    description: 'Regulates land acquisition with fair compensation and rehabilitation.',
    summary: 'Ensures transparency and consent in land acquisition.',
    content:
      'This Act, 2013 requires fair compensation and rehabilitation for affected families when land is acquired. It also mandates social impact assessments and transparency.',
    keyPoints: ['Fair compensation', 'Rehabilitation and resettlement', 'Transparency measures']
  },
  {
    title: 'Companies Act',
    actNumber: '18 of 2013',
    year: 2013,
    category: 'other',
    description: 'Governs incorporation, management, and regulation of companies.',
    summary: 'Sets rules for corporate governance and compliance.',
    content:
      'The Companies Act, 2013 provides the legal framework for company formation and governance. It covers directors duties, audits, and shareholder protections.',
    keyPoints: ['Company incorporation', 'Corporate governance', 'Compliance requirements']
  },
  {
    title: 'Negotiable Instruments Act',
    actNumber: '26 of 1881',
    year: 1881,
    category: 'other',
    description: 'Covers promissory notes, cheques, and bills of exchange.',
    summary: 'Regulates negotiable instruments and cheque dishonour penalties.',
    content:
      'The Negotiable Instruments Act, 1881 defines negotiable instruments and liabilities. It includes rules for cheque dishonour and related penalties.',
    keyPoints: ['Covers cheques and bills', 'Cheque dishonour offence', 'Liability rules']
  },
  {
    title: 'Indian Evidence Act',
    actNumber: '1 of 1872',
    year: 1872,
    category: 'public_safety',
    description: 'Defines rules on admissibility and relevance of evidence in courts.',
    summary: 'Sets the law of evidence for judicial proceedings.',
    content:
      'The Evidence Act, 1872 sets standards for admissible evidence in courts. It covers documents, witnesses, and presumptions used in trials.',
    keyPoints: ['Admissibility rules', 'Witness testimony', 'Documentary evidence']
  },
  {
    title: 'Limitation Act',
    actNumber: '36 of 1963',
    year: 1963,
    category: 'other',
    description: 'Sets time limits for filing civil suits and appeals.',
    summary: 'Ensures legal claims are brought within prescribed time.',
    content:
      'The Limitation Act, 1963 prescribes time limits for different legal actions. It prevents stale claims and encourages timely litigation.',
    keyPoints: ['Time limits for suits', 'Appeal deadlines', 'Prevents stale claims']
  },
  {
    title: 'Registration Act',
    actNumber: '16 of 1908',
    year: 1908,
    category: 'municipal_laws',
    description: 'Provides rules for registration of documents affecting property.',
    summary: 'Ensures legal validity of important property documents.',
    content:
      'The Registration Act, 1908 mandates registration of certain documents like property transfers. It provides evidence of ownership and reduces fraud.',
    keyPoints: ['Document registration', 'Property transfer validity', 'Fraud prevention']
  },
  {
    title: 'Electricity Act',
    actNumber: '36 of 2003',
    year: 2003,
    category: 'public_safety',
    description: 'Regulates generation, distribution, and use of electricity.',
    summary: 'Sets rules for power sector and consumer protection.',
    content:
      'The Electricity Act, 2003 reforms the power sector, enables licensing, and protects consumers. It covers tariffs, supply standards, and penalties for theft.',
    keyPoints: ['Power sector regulation', 'Consumer rights', 'Theft penalties']
  },
  {
    title: 'Water (Prevention and Control of Pollution) Act',
    actNumber: '6 of 1974',
    year: 1974,
    category: 'environment',
    description: 'Prevents and controls water pollution.',
    summary: 'Establishes boards to regulate water quality and pollution.',
    content:
      'The Water Act, 1974 provides for prevention and control of water pollution and for maintaining water quality. It sets up pollution control boards with regulatory powers.',
    keyPoints: ['Water pollution control', 'Regulatory boards', 'Quality standards']
  },
  {
    title: 'Air (Prevention and Control of Pollution) Act',
    actNumber: '14 of 1981',
    year: 1981,
    category: 'environment',
    description: 'Prevents and controls air pollution.',
    summary: 'Empowers boards to regulate emissions and air quality.',
    content:
      'The Air Act, 1981 provides for prevention and control of air pollution. It allows authorities to set emission standards and regulate polluting industries.',
    keyPoints: ['Air pollution control', 'Emission standards', 'Regulatory enforcement']
  },
  {
    title: 'Wildlife Protection Act',
    actNumber: '53 of 1972',
    year: 1972,
    category: 'environment',
    description: 'Protects wild animals, birds, and plants.',
    summary: 'Regulates hunting and creates protected areas.',
    content:
      'The Wildlife Protection Act, 1972 protects wildlife and biodiversity. It bans hunting of protected species and establishes sanctuaries and national parks.',
    keyPoints: ['Protected species', 'Hunting restrictions', 'Protected areas']
  },
  {
    title: 'Forest Conservation Act',
    actNumber: '69 of 1980',
    year: 1980,
    category: 'environment',
    description: 'Restricts diversion of forest land for non-forest use.',
    summary: 'Requires approvals to protect forest resources.',
    content:
      'The Forest Conservation Act, 1980 restricts use of forest land for non-forest purposes without central approval. It helps conserve forests and biodiversity.',
    keyPoints: ['Protects forest land', 'Approval required for diversion', 'Conservation focus']
  },
  {
    title: 'National Green Tribunal Act',
    actNumber: '19 of 2010',
    year: 2010,
    category: 'environment',
    description: 'Creates a tribunal for speedy environmental justice.',
    summary: 'Provides specialized forum for environmental disputes.',
    content:
      'The NGT Act, 2010 establishes a tribunal for expeditious disposal of environmental cases. It handles disputes related to environment protection and conservation.',
    keyPoints: ['Environmental tribunal', 'Speedy disposal', 'Specialized expertise']
  },
  {
    title: 'Food Safety and Standards Act',
    actNumber: '34 of 2006',
    year: 2006,
    category: 'health_sanitation',
    description: 'Sets standards for food safety and regulates the food business.',
    summary: 'Creates FSSAI and ensures safe food standards.',
    content:
      'The Food Safety and Standards Act, 2006 establishes FSSAI and sets standards for food safety. It regulates food businesses to protect consumers from unsafe food.',
    keyPoints: ['Food safety standards', 'FSSAI regulation', 'Consumer protection']
  },
  {
    title: 'Clinical Establishments Act',
    actNumber: '23 of 2010',
    year: 2010,
    category: 'health_sanitation',
    description: 'Regulates clinical establishments and minimum standards of care.',
    summary: 'Ensures quality and transparency in healthcare services.',
    content:
      'The Clinical Establishments Act, 2010 sets minimum standards for hospitals and clinics. It mandates registration and transparency of services and rates.',
    keyPoints: ['Registration required', 'Minimum care standards', 'Transparency of services']
  },
  {
    title: 'Mental Healthcare Act',
    actNumber: '10 of 2017',
    year: 2017,
    category: 'health_sanitation',
    description: 'Protects rights of persons with mental illness and ensures access to care.',
    summary: 'Guarantees mental healthcare as a right.',
    content:
      'The Mental Healthcare Act, 2017 recognizes the right to mental healthcare and decriminalizes suicide attempts. It sets standards for mental health services and safeguards patient rights.',
    keyPoints: ['Right to mental healthcare', 'Patient rights', 'Care standards']
  },
  {
    title: 'Maternity Benefit Act',
    actNumber: '53 of 1961',
    year: 1961,
    category: 'employment',
    description: 'Provides maternity leave and benefits for eligible women employees.',
    summary: 'Ensures paid leave and job protection for mothers.',
    content:
      'The Maternity Benefit Act, 1961 grants paid maternity leave and other benefits. It protects employment during maternity and requires certain workplace facilities.',
    keyPoints: ['Paid maternity leave', 'Job protection', 'Workplace facilities']
  },
  {
    title: 'Factories Act',
    actNumber: '63 of 1948',
    year: 1948,
    category: 'employment',
    description: 'Regulates working conditions in factories.',
    summary: 'Sets safety, health, and welfare standards for workers.',
    content:
      'The Factories Act, 1948 sets minimum standards for workplace safety, health, and welfare. It regulates working hours, leave, and safety requirements.',
    keyPoints: ['Workplace safety standards', 'Working hours rules', 'Worker welfare']
  },
  {
    title: 'Industrial Disputes Act',
    actNumber: '14 of 1947',
    year: 1947,
    category: 'employment',
    description: 'Provides mechanisms to resolve industrial disputes.',
    summary: 'Regulates layoffs, retrenchment, and dispute resolution.',
    content:
      'The Industrial Disputes Act, 1947 provides procedures for resolving conflicts between employers and workers. It regulates strikes, lockouts, layoffs, and retrenchment.',
    keyPoints: ['Dispute resolution', 'Rules for layoffs', 'Regulates strikes']
  },
  {
    title: 'Trade Unions Act',
    actNumber: '16 of 1926',
    year: 1926,
    category: 'employment',
    description: 'Provides for registration and protection of trade unions.',
    summary: 'Legal recognition and protections for unions.',
    content:
      'The Trade Unions Act, 1926 allows registration of trade unions and protects their rights. It provides legal status and regulates union activities.',
    keyPoints: ['Union registration', 'Legal protections', 'Regulated activities']
  },
  {
    title: 'Equal Remuneration Act',
    actNumber: '25 of 1976',
    year: 1976,
    category: 'employment',
    description: 'Ensures equal pay for equal work for men and women.',
    summary: 'Promotes gender equality in wages.',
    content:
      'The Equal Remuneration Act, 1976 mandates equal pay for men and women doing the same work. It prohibits discrimination in recruitment and service conditions.',
    keyPoints: ['Equal pay for equal work', 'No gender discrimination', 'Fair recruitment']
  },
  {
    title: 'Epidemic Diseases Act',
    actNumber: '3 of 1897',
    year: 1897,
    category: 'public_safety',
    description: 'Provides special measures to control the spread of epidemics.',
    summary: 'Empowers authorities to take public health actions.',
    content:
      'The Epidemic Diseases Act, 1897 gives powers to state and central governments to take measures to prevent the spread of dangerous epidemics. It allows regulations and penalties during outbreaks.',
    keyPoints: ['Public health powers', 'Outbreak control', 'Penalties for violations']
  },
  {
    title: 'Disaster Management Act',
    actNumber: '53 of 2005',
    year: 2005,
    category: 'public_safety',
    description: 'Creates a framework for disaster preparedness and response.',
    summary: 'Defines authorities and plans for disaster management.',
    content:
      'The Disaster Management Act, 2005 establishes national and state authorities for disaster management. It outlines prevention, mitigation, and response measures.',
    keyPoints: ['Disaster authorities', 'Preparedness planning', 'Response coordination']
  },
  {
    title: 'Arbitration and Conciliation Act',
    actNumber: '26 of 1996',
    year: 1996,
    category: 'other',
    description: 'Provides legal framework for arbitration and conciliation.',
    summary: 'Enables faster, private dispute resolution.',
    content:
      'The Arbitration and Conciliation Act, 1996 governs arbitration agreements and proceedings. It promotes alternative dispute resolution outside courts.',
    keyPoints: ['Arbitration framework', 'Conciliation process', 'Faster dispute resolution']
  },
  {
    title: 'Protection of Human Rights Act',
    actNumber: '10 of 1994',
    year: 1993,
    category: 'civic_rights',
    description: 'Establishes human rights commissions and protects human rights.',
    summary: 'Provides mechanisms to investigate human rights violations.',
    content:
      'The Protection of Human Rights Act, 1993 establishes the National and State Human Rights Commissions. It enables inquiry into violations and recommends remedies.',
    keyPoints: ['Human rights commissions', 'Inquiry powers', 'Remedy recommendations']
  },
  {
    title: 'Hindu Marriage Act',
    actNumber: '25 of 1955',
    year: 1955,
    category: 'other',
    description: 'Governs marriage and divorce among Hindus.',
    summary: 'Sets conditions for marriage, divorce, and maintenance.',
    content:
      'The Hindu Marriage Act, 1955 outlines conditions for a valid marriage and procedures for divorce and maintenance. It applies to Hindus, Buddhists, Jains, and Sikhs.',
    keyPoints: ['Marriage conditions', 'Divorce provisions', 'Maintenance rules']
  },
  {
    title: 'Special Marriage Act',
    actNumber: '43 of 1954',
    year: 1954,
    category: 'other',
    description: 'Allows civil marriage irrespective of religion.',
    summary: 'Provides legal framework for interfaith marriages.',
    content:
      'The Special Marriage Act, 1954 allows civil marriages without religious ceremonies. It includes registration, notice, and legal rights for spouses.',
    keyPoints: ['Civil marriage', 'Interfaith marriage', 'Registration requirements']
  },
  {
    title: 'Guardians and Wards Act',
    actNumber: '8 of 1890',
    year: 1890,
    category: 'civic_rights',
    description: 'Governs appointment of guardians for minors and their property.',
    summary: 'Protects welfare and property of minors.',
    content:
      'The Guardians and Wards Act, 1890 provides the process for appointing guardians for minors. Courts decide based on the child welfare and property protection.',
    keyPoints: ['Guardian appointment', 'Child welfare', 'Property protection']
  },
  {
    title: 'Transplantation of Human Organs and Tissues Act',
    actNumber: '42 of 1994',
    year: 1994,
    category: 'health_sanitation',
    description: 'Regulates organ donation and transplantation.',
    summary: 'Prevents organ trafficking and ensures ethical transplants.',
    content:
      'The Transplantation Act, 1994 regulates organ donation and transplantation. It defines authorization procedures and penalizes commercial trafficking.',
    keyPoints: ['Ethical donation rules', 'Authorization required', 'Trafficking penalties']
  },
  {
    title: 'Road Transport and Safety Rules (General)',
    actNumber: '59 of 1988',
    year: 1988,
    category: 'traffic_rules',
    description: 'General road safety rules derived from the Motor Vehicles framework.',
    summary: 'Promotes safe driving and compliance.',
    content:
      'These rules summarize key safety obligations for drivers, including helmet and seat belt use, speed limits, and safe driving practices. Non-compliance can lead to penalties under the Motor Vehicles Act.',
    keyPoints: ['Helmet and seat belts', 'Speed compliance', 'Safe driving practices']
  }
];

const seed = async () => {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@aurex.com';
  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    adminUser = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
  }
  if (!adminUser) {
    console.error('No admin user found. Create an admin user first, then run the seeder.');
    process.exit(1);
  }

  await Law.deleteMany({});

  for (const law of lawsSeed) {
    await Law.create({
      ...law,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
      isActive: law.isActive !== false
    });
  }

  console.log(`Seed complete. Inserted: ${lawsSeed.length}`);

  process.exit(0);
};

seed().catch((error) => {
  console.error('Seeder failed:', error);
  process.exit(1);
});

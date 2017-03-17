-- phpMyAdmin SQL Dump
-- version 4.2.11
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Sep 22, 2015 at 05:52 AM
-- Server version: 5.6.21
-- PHP Version: 5.6.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `facebook_autopost`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`ieltsuser`@`localhost` PROCEDURE `proc_autoregister`(IN `p_deviceType` VARCHAR(50), IN `p_deviceToken` VARCHAR(255), IN `p_latitude` VARCHAR(100), IN `p_longitude` VARCHAR(50), IN `p_deviceId` VARCHAR(50), IN `p_OSversion` VARCHAR(50), IN `p_AppVersion` VARCHAR(50))
BEGIN
declare realCustId int;

 if ( SELECT 1 FROM TBL_customers WHERE 
 -- custCode=p_custCode 
 -- or 
 deviceId=p_deviceId
 ) then
begin
update TBL_customers set deviceToken=p_deviceToken, OSVersion=p_OSversion,AppVersion =p_AppVersion
where  deviceId=p_deviceId;
end;
 else begin
	 insert into TBL_customers (deviceToken,latitude,longitude,deviceId,deviceType,OSversion,AppVersion) 
	 values (p_deviceToken,p_latitude,p_longitude,p_deviceId,p_deviceType,p_OSversion,p_AppVersion);
	 select custId into realCustId from tbl_customers where deviceId=p_deviceId;
	insert into tbl_balances(custId,credit,debit,remainQty) values (realCustId,0,0,0);
	end;
END IF;

 select custId ,deviceId,custName,custPhone,custEmail,gender,custAddress,loginId,loginType,birthday,booId
 from TBL_customers where
 -- custCode=p_custCode 
 -- or 
 deviceId=p_deviceId
 ;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_buyproduct`(IN `p_productId` INT, IN `p_custId` INT)
BEGIN
insert into tbl_product_txns(productId,tbl_product_txns.userId) values (p_productId,p_custId);
select a.txnId,a.productName, a.username from tbl_product_txns a where a.productId=p_productid and a.userId=p_custid;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_buyTopic`(IN `p_custId` INT, IN `p_topicId` INT)
BEGIN
declare custBalance int;
declare remainItem int;

set custBalance =0;
    select (debit-credit) into custBalance from tbl_balances where custId = p_custid; 
    if (custBalance >= 15000) then
      begin
       insert into tbl_ielts_txns (custId,topicId) values (p_custId,p_topicId);
       update tbl_balances set credit=credit+15000 where custId=p_custId;
       select 1 as dataValue
		 -- , 0 as remainQty,  15000 as txnAmt 
		 ;
      end;
    else
      begin
       select 0 as dataValue;
      end;
    end if;
 
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_buytopic10`(IN `p_custId` INT, IN `p_topicId` INT)
BEGIN
declare custBalance int;
DECLARE done INT DEFAULT FALSE;
declare remainItem int;
declare mTopicId int;
declare currentDate Date;
declare totalItem int;

declare cur1 CURSOR for 
(select id from  tbl_ielts where (id not in (select topicId from tbl_ielts_txns where custId=p_custId )) and examdate >= (select examDate  from tbl_ielts where id=p_topicId) and topicType='P' order by examDate asc limit 10 offset 0);
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
select examDate into currentDate from tbl_ielts where id=p_topicId;




set totalItem=0;



select count(*) into totalItem from (select id from  tbl_ielts where (id not in (select topicId from tbl_ielts_txns where custId=p_custId )) and examDate>=currentDate and topicType='P' order by examDate asc limit 10 offset 0) as temptbl;

set custBalance =0;
    select (debit-credit) into custBalance from tbl_balances where custId = p_custid; 
    if (custBalance >= 100000) then
      begin
      update tbl_balances set credit=credit+100000 where custId=p_custId;
OPEN cur1;
read_loop: LOOP
fetch cur1 into mTopicId;
if done then leave read_loop;
end if;
Insert into tbl_ielts_txns (custId,topicId) values (p_custId,mTopicId);
END LOOP;

Close cur1;
       -- insert into tbl_ielts_txns (custId,topicId) values (p_custId,p_topicId);
 -- select id from tbl_ielts where examDate is 
 
update  tbl_balances set remainQty=remainQty+10-totalItem where custId=p_custId;
             select 1  as dataValue
		 -- , 0 as remainQty,  15000 as txnAmt 
		 ;
      end;
    else
      begin
       select 0 as dataValue;
      end;
    end if;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_buyYear`(IN `p_custId` INT, IN `p_year` INT)
BEGIN

declare done int default false;
declare custBalance int;
declare mTopicId int;
declare cur1 CURSOR for 
select id from  tbl_ielts where (
id not in (select topicId from tbl_ielts_txns where custId=p_custId )) and YEAR(examDate)= p_year;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;


set custBalance =0;
    select (debit-credit) into custBalance from tbl_balances where custId = p_custid; 
if (custBalance >= 400000) then
      begin
      update tbl_balances set credit=credit+400000 where custId=p_custId;
OPEN cur1;
read_loop: LOOP
fetch cur1 into mTopicId;
if done then leave read_loop;
end if;
Insert into tbl_ielts_txns (custId,topicId) values (p_custId,mTopicId);
END LOOP;


Close cur1;
select 1 as dataValue;
end;
else 
select 0 as dataValue;
end if;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_customerinfo`(IN `p_custId` INT)
BEGIN
 select custId ,custCode,deviceId,custName,custPhone,custEmail,gender,custAddress,loginId,loginType,birthday,booId from tbl_customers where custId=p_custId;
END$$

CREATE DEFINER=`ieltsuser`@`localhost` PROCEDURE `proc_customerupdate`(IN `p_custId` INT, IN `p_custName` VARCHAR(50), IN `p_custEmail` VARCHAR(50), IN `p_custPhone` VARCHAR(50), IN `p_birthday` VARCHAR(50), IN `p_gender` VARCHAR(50), IN `p_custAddress` VARCHAR(250), IN `p_loginId` VARCHAR(50), IN `p_loginType` VARCHAR(50), IN `p_loginPassword` VARCHAR(50), IN `p_booId` VARCHAR(50))
BEGIN
update tbl_customers set custName=p_custName,custEmail=p_custEmail,custPhone=p_custPhone,
-- custCode= REPLACE(p_custCode, ':', ''),
 birthday=p_birthday,
gender=p_gender,
custAddress=p_custAddress,
loginId=p_loginId,
loginType=p_loginType
-- ,latitude=p_latitude,longtitude=p_longtitude 
where custId=p_custId 
-- and deviceId=p_deviceId
;

select  custId ,deviceId,custName,custPhone,custEmail,gender,custAddress,loginId,loginType,birthday,booId from tbl_customers where custId=p_custId ;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_deposits`(IN `p_custId` INT, IN `p_txnAmt` INT, IN `p_invoiceId` VARCHAR(50), IN `p_txnDesc` VARCHAR(50))
BEGIN


insert into tbl_ielts_deposittxn (custId,txnAmt, invoiceId,txnDesc) values (p_custId,p_txnAmt,p_invoiceId,p_txnDesc);
if exists (select * from tbl_balances where custId=p_custId)
then
update tbl_balances set tbl_balances.debit=tbl_balances.debit+p_txnAmt where custId=p_custId;
else 
insert into tbl_balances (custId,debit,credit) values (p_custId,p_txnAmt,0);
end if;
END$$

CREATE DEFINER=`boouser`@`localhost` PROCEDURE `proc_getgift`(IN `p_giftId` INT, IN `p_custId` INT)
BEGIN
INSERT INTO `tbl_gift_txns` ( `custid`, `giftId`) VALUES (p_custId, p_giftId);
select * from tbl_gift_txns where custId=p_custId and giftId=p_giftId;

END$$

CREATE DEFINER=`boouser`@`localhost` PROCEDURE `proc_getproducts`(IN `p_merchId` INT, IN `p_currentId` INT)
BEGIN

select  p.merchId, p.productId,p.productName, p.productMerchCatId, p.productDesc, p.price, p.oldPrice, p.productImageLink,p.productImageWidth,p.productImageHeight,p.productImage, p.productImage1, p.productImage2,p.productImage3 from tbl_products p where 
p.merchId = p_merchId  and p.`status` ='Y' order by productId desc limit p_currentId,20; 
/*
if (p_currentId = 0) then
begin
select  p.merchId, p.productId,p.productName, p.productMerchCatId, p.productDesc, p.price, p.oldPrice, p.productImageLink,p.productImageWidth,p.productImageHeight,p.productImage, p.productImage1, p.productImage2,p.productImage3 from tbl_products p where 
p.merchId = p_merchId  and p.`status` ='Y' order by productId desc limit 10 ;
end;
else
select  p.merchId, p.productId,p.productName, p.productMerchCatId, p.productDesc, p.price, p.oldPrice, p.productImageLink,p.productImageWidth,p.productImageHeight,p.productImage, p.productImage1, p.productImage2,p.productImage3 from tbl_products p where 
p.merchId = p_merchId  and p.`status` ='Y' and (productId < p_currentId) order by productId desc limit 10  ;
end if;
*/
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_likefeed`(IN `p_feedId` INT, IN `p_custId` INT)
BEGIN
insert into tbl_like_feeds (feedId,custId) values (p_feedId,p_custId);
select 1 as dataResult;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_likeproduct`(IN `p_productId` INT, IN `p_custId` INT)
BEGIN
insert into tbl_like_products(productId,custId) values(p_productId,p_custId);
select 1 as dataValue;
END$$

CREATE DEFINER=`ozuser`@`localhost` PROCEDURE `proc_listsales`(IN `p_currentId` INT)
BEGIN
if (p_currentId is null) then set p_currentId = 0;
end if;
select * from view_merch_campaigns where saleId > p_currentId;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_news`(IN `p_currentId` INT)
BEGIN
select  * from tbl_news where status='Y'  order by news_id desc limit p_currentId,5; 

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_topics`(IN `p_custId` INT, IN `p_year` INT)
BEGIN

select tbl_ielts.id, YEAR (tbl_ielts.examDate)  as year, tbl_ielts.examDate, tbl_ielts.topic, HEX(fullSample) as fullSample , tbl_ielts.guide, tbl_ielts.shortDesc,tbl_ielts.topicType
, case when exists (select * from tbl_ielts_txns where tbl_ielts.id=tbl_ielts_txns.topicId and  tbl_ielts_txns.custId=p_custId  ) then 'B' 
else tbl_ielts.topicType end as topicType
from tbl_ielts where YEAR (tbl_ielts.examDate) = p_year and topicType='P'  order by examDate desc;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_updatetopic`(IN `p_topicId` INT)
BEGIN
declare mCustId int;
DECLARE done INT DEFAULT FALSE;
declare cur1 CURSOR for select custId from tbl_balances where remainQty >=1;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

OPEN cur1;
read_loop: LOOP
fetch cur1 into mCustId;
if done then leave read_loop;
end if;
if not exists  (select * from tbl_ielts_txns where custId = mCustId and topicId=p_topicId) then
begin
Insert into tbl_ielts_txns (custId,topicId) values (mCustId,p_topicId);
update tbl_balances set remainQty=remainQty-1 where custId=mCustId;
end;
end if;
END LOOP;



END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `admin_acl`
--

CREATE TABLE IF NOT EXISTS `admin_acl` (
`id` smallint(5) unsigned NOT NULL,
  `route` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `groups` varchar(500) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'guest'
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `admin_acl`
--

INSERT INTO `admin_acl` (`id`, `route`, `groups`) VALUES
(1, 'demo/index', 'guest,member,admin'),
(2, 'demo1/index', 'guest,admin');

-- --------------------------------------------------------

--
-- Table structure for table `admin_groups`
--

CREATE TABLE IF NOT EXISTS `admin_groups` (
`id` smallint(5) unsigned NOT NULL,
  `name` varchar(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'guest'
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `admin_groups`
--

INSERT INTO `admin_groups` (`id`, `name`) VALUES
(1, 'guest'),
(2, 'member'),
(3, 'admin'),
(4, 'editor');

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE IF NOT EXISTS `admin_users` (
`id` smallint(5) unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `username` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `group` varchar(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'guest',
  `block` tinyint(1) NOT NULL DEFAULT '0',
  `avatar` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `theme` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'default'
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `name`, `username`, `email`, `password`, `group`, `block`, `avatar`, `theme`) VALUES
(22, 'Pham Thanh Tu', 'tupt', 'tu.phamthanh86@gmail.com', 'e10adc3949ba59abbe56e057f20f883e', 'admin', 0, 'media/images/user/53a8e617e4e1c.jpg', 'gray');

-- --------------------------------------------------------

--
-- Table structure for table `config`
--

CREATE TABLE IF NOT EXISTS `config` (
`id` int(10) unsigned NOT NULL,
  `label` varchar(200) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `name` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `type` set('yesno','dropdown','text','textarea','editor') CHARACTER SET utf8 NOT NULL DEFAULT '',
  `value` text COLLATE utf8_unicode_ci NOT NULL,
  `options` tinytext COLLATE utf8_unicode_ci NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=57 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `config`
--

INSERT INTO `config` (`id`, `label`, `name`, `type`, `value`, `options`) VALUES
(4, 'Logo', 'logo', 'text', 'themes/magicscan/img/magicscan-favi.png', ''),
(8, 'Footer Vietnamese', 'footer_vi', 'editor', '<div class="pull-left">Vinatransfer Website<br />\r\nC&ocirc;ng ty cổ phẩn Xuất nhập khẩu Linh Trung T&iacute;n<br />\r\nTrụ sở: 100 đường Bưởi, phường Ngọc Kh&aacute;nh, quận Ba Đ&igrave;nh, H&agrave; Nội.</div>\r\n\r\n<div class="pull-right">&copy; Copyright 2014 tubackkhoa@gmail.com, All rights reserved</div>', ''),
(46, 'Tiêu đề website', 'title', 'text', 'Xay dung, xây dựng, Xây dựng công nghiệp, bê tông tông thương phẩm', ''),
(48, 'Mô tả website', 'description', 'text', 'Xay dung, xây dựng, Xây dựng công nghiệp, bê tông tông thương phẩm', ''),
(49, 'Footer English', 'footer_en', 'editor', '<div class="pull-left">Vinatransfer Website<br />\r\nCompany stock in Linh Trung Export Credit <br/>\r\nHead office: 100 Pomelo Street, Ngoc Khanh Ward, Ba Dinh District, Ha Noi.</div>\r\n\r\n<div class="pull-right">&copy; Copyright 2014 tubackkhoa@gmail.com, All rights reserved</div>', ''),
(54, 'News Footer 1', 'news_footer_1', 'text', '1', ''),
(55, 'News Footer 1', 'news_footer_2', 'text', '2', ''),
(56, 'News Footer 3', 'news_footer_3', 'text', '3', '');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE IF NOT EXISTS `notification` (
`id` int(11) NOT NULL,
  `sent_date` int(11) NOT NULL DEFAULT '0',
  `type` varchar(50) DEFAULT NULL,
  `recipient_type` varchar(50) DEFAULT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `sender_type` varchar(50) DEFAULT NULL,
  `read` int(11) DEFAULT NULL,
  `link` varchar(200) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `data` blob,
  `publish` int(11) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`id`, `sent_date`, `type`, `recipient_type`, `recipient_id`, `sender_id`, `sender_type`, `read`, `link`, `title`, `data`, `publish`) VALUES
(1, 1402994389, 'appointment', 'doctor', 23, 0, 'customer', 0, 'enadmin/medical/notification/0', 'Event number 0', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652030223b7d, 1),
(2, 1402994389, 'appointment', 'doctor', 23, 1, 'customer', 0, 'enadmin/medical/notification/1', 'Event number 1', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652031223b7d, 1),
(3, 1402994389, 'appointment', 'doctor', 23, 2, 'customer', 0, 'enadmin/medical/notification/2', 'Event number 2', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652032223b7d, 1),
(4, 1402994389, 'appointment', 'doctor', 23, 3, 'customer', 0, 'enadmin/medical/notification/3', 'Event number 3', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652033223b7d, 1),
(5, 1402994389, 'appointment', 'doctor', 23, 4, 'customer', 0, 'enadmin/medical/notification/4', 'Event number 4', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652034223b7d, 1),
(6, 1402994389, 'appointment', 'doctor', 23, 5, 'customer', 0, 'enadmin/medical/notification/5', 'Event number 5', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652035223b7d, 1),
(7, 1402994389, 'appointment', 'doctor', 23, 6, 'customer', 0, 'enadmin/medical/notification/6', 'Event number 6', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652036223b7d, 1),
(8, 1402994389, 'appointment', 'doctor', 23, 7, 'customer', 0, 'enadmin/medical/notification/7', 'Event number 7', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652037223b7d, 1),
(9, 1402994389, 'appointment', 'doctor', 23, 8, 'customer', 0, 'enadmin/medical/notification/8', 'Event number 8', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652038223b7d, 1),
(10, 1402994389, 'appointment', 'doctor', 23, 9, 'customer', 0, 'enadmin/medical/notification/9', 'Event number 9', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652039223b7d, 1),
(11, 1402995125, 'appointment', 'doctor', 23, 0, 'customer', 0, 'enadmin/medical/notification/0', 'Event number 0', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652030223b7d, 1),
(12, 1402995125, 'appointment', 'doctor', 23, 1, 'customer', 0, 'enadmin/medical/notification/1', 'Event number 1', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652031223b7d, 1),
(13, 1402995125, 'appointment', 'doctor', 23, 2, 'customer', 0, 'enadmin/medical/notification/2', 'Event number 2', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652032223b7d, 1),
(14, 1402995125, 'appointment', 'doctor', 23, 3, 'customer', 0, 'enadmin/medical/notification/3', 'Event number 3', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652033223b7d, 1),
(15, 1402995125, 'appointment', 'doctor', 23, 4, 'customer', 0, 'enadmin/medical/notification/4', 'Event number 4', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652034223b7d, 1),
(16, 1402995125, 'appointment', 'doctor', 23, 5, 'customer', 0, 'enadmin/medical/notification/5', 'Event number 5', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652035223b7d, 1),
(17, 1402995125, 'appointment', 'doctor', 23, 6, 'customer', 0, 'enadmin/medical/notification/6', 'Event number 6', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652036223b7d, 1),
(18, 1402995125, 'appointment', 'doctor', 23, 7, 'customer', 0, 'enadmin/medical/notification/7', 'Event number 7', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652037223b7d, 1),
(19, 1402995125, 'appointment', 'doctor', 23, 8, 'customer', 0, 'enadmin/medical/notification/8', 'Event number 8', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652038223b7d, 1),
(20, 1402995125, 'appointment', 'doctor', 23, 9, 'customer', 0, 'enadmin/medical/notification/9', 'Event number 9', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652039223b7d, 1),
(21, 1402995127, 'appointment', 'doctor', 23, 0, 'customer', 0, 'enadmin/medical/notification/0', 'Event number 0', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652030223b7d, 1),
(22, 1402995127, 'appointment', 'doctor', 23, 1, 'customer', 0, 'enadmin/medical/notification/1', 'Event number 1', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652031223b7d, 1),
(23, 1402995127, 'appointment', 'doctor', 23, 2, 'customer', 0, 'enadmin/medical/notification/2', 'Event number 2', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652032223b7d, 1),
(24, 1402995127, 'appointment', 'doctor', 23, 3, 'customer', 0, 'enadmin/medical/notification/3', 'Event number 3', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652033223b7d, 1),
(25, 1402995127, 'appointment', 'doctor', 23, 4, 'customer', 0, 'enadmin/medical/notification/4', 'Event number 4', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652034223b7d, 1),
(26, 1402995127, 'appointment', 'doctor', 23, 5, 'customer', 0, 'enadmin/medical/notification/5', 'Event number 5', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652035223b7d, 1),
(27, 1402995127, 'appointment', 'doctor', 23, 6, 'customer', 0, 'enadmin/medical/notification/6', 'Event number 6', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652036223b7d, 1),
(28, 1402995127, 'appointment', 'doctor', 23, 7, 'customer', 0, 'enadmin/medical/notification/7', 'Event number 7', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652037223b7d, 1),
(29, 1402995127, 'appointment', 'doctor', 23, 8, 'customer', 0, 'enadmin/medical/notification/8', 'Event number 8', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652038223b7d, 1),
(30, 1402995127, 'appointment', 'doctor', 23, 9, 'customer', 0, 'enadmin/medical/notification/9', 'Event number 9', 0x613a313a7b733a333a226b6579223b733a373a2276616c75652039223b7d, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_events`
--

CREATE TABLE IF NOT EXISTS `tbl_events` (
`id` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `doctor_name` varchar(100) DEFAULT NULL,
  `cust_id` int(11) NOT NULL,
  `cust_name` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Available',
  `clinic_id` varchar(50) DEFAULT NULL,
  `clinic_name` varchar(250) DEFAULT NULL,
  `clinic_address` varchar(250) DEFAULT NULL,
  `start` varchar(50) NOT NULL,
  `end` varchar(50) NOT NULL,
  `start_tick` int(11) NOT NULL,
  `end_tick` int(11) NOT NULL,
  `custBookTimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `appointment_type` int(11) NOT NULL DEFAULT '0',
  `visit_type` int(11) NOT NULL DEFAULT '0',
  `info` varchar(250) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=592 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_events`
--

INSERT INTO `tbl_events` (`id`, `reason`, `doctor_id`, `doctor_name`, `cust_id`, `cust_name`, `status`, `clinic_id`, `clinic_name`, `clinic_address`, `start`, `end`, `start_tick`, `end_tick`, `custBookTimeStamp`, `appointment_type`, `visit_type`, `info`) VALUES
(239, '', 2, 'Thang Nguyen1', 25, 'Dao Thanh Tuyen', 'Booked', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 08:30:00 GMT+0000', 'Thu Jul 17 2014 09:00:00 GMT+0000', 1405585800, 1405587600, '2015-08-11 04:20:33', 0, 1, 'Dao Thanh Tuyen(M:84911233452:1988) Visit Type: Short Visit Reason:'),
(240, '', 2, 'Thang Nguyen1', 25, 'Dao Thanh Tuyen', 'Booked', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 09:00:00 GMT+0000', 'Thu Jul 17 2014 09:30:00 GMT+0000', 1405587600, 1405589400, '2015-08-11 04:20:33', 0, 1, 'Dao Thanh Tuyen(M:84911233452:1988) Visit Type: Short Visit Reason:'),
(241, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 09:30:00 GMT+0000', 'Thu Jul 17 2014 10:00:00 GMT+0000', 1405589400, 1405591200, '2015-08-11 04:20:33', 0, 0, NULL),
(242, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 10:00:00 GMT+0000', 'Thu Jul 17 2014 10:30:00 GMT+0000', 1405591200, 1405593000, '2015-08-11 04:20:33', 0, 0, NULL),
(243, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 10:30:00 GMT+0000', 'Thu Jul 17 2014 11:00:00 GMT+0000', 1405593000, 1405594800, '2015-08-11 04:20:33', 0, 0, NULL),
(244, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 11:00:00 GMT+0000', 'Thu Jul 17 2014 11:30:00 GMT+0000', 1405594800, 1405596600, '2015-08-11 04:20:33', 0, 0, NULL),
(245, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 11:30:00 GMT+0000', 'Thu Jul 17 2014 12:00:00 GMT+0000', 1405596600, 1405598400, '2015-08-11 04:20:33', 0, 0, NULL),
(246, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 12:00:00 GMT+0000', 'Thu Jul 17 2014 12:30:00 GMT+0000', 1405598400, 1405600200, '2015-08-11 04:20:33', 0, 0, NULL),
(247, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 12:30:00 GMT+0000', 'Thu Jul 17 2014 13:00:00 GMT+0000', 1405600200, 1405602000, '2015-08-11 04:20:33', 0, 0, NULL),
(248, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 13:00:00 GMT+0000', 'Thu Jul 17 2014 13:30:00 GMT+0000', 1405602000, 1405603800, '2015-08-11 04:20:33', 0, 0, NULL),
(249, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 13:30:00 GMT+0000', 'Thu Jul 17 2014 14:00:00 GMT+0000', 1405603800, 1405605600, '2015-08-11 04:20:33', 0, 0, NULL),
(250, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 14:00:00 GMT+0000', 'Thu Jul 17 2014 14:30:00 GMT+0000', 1405605600, 1405607400, '2015-08-11 04:20:33', 0, 0, NULL),
(251, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 14:30:00 GMT+0000', 'Thu Jul 17 2014 15:00:00 GMT+0000', 1405607400, 1405609200, '2015-08-11 04:20:33', 0, 0, NULL),
(252, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 15:00:00 GMT+0000', 'Thu Jul 17 2014 15:30:00 GMT+0000', 1405609200, 1405611000, '2015-08-11 04:20:33', 0, 0, NULL),
(253, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 15:30:00 GMT+0000', 'Thu Jul 17 2014 16:00:00 GMT+0000', 1405611000, 1405612800, '2015-08-11 04:20:33', 0, 0, NULL),
(254, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 16:00:00 GMT+0000', 'Thu Jul 17 2014 16:30:00 GMT+0000', 1405612800, 1405614600, '2015-08-11 04:20:33', 0, 0, NULL),
(255, '', 2, 'Thang Nguyen1', 24, 'Vuong Van Truong', 'Booked', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 08:00:00 GMT+0000', 'Thu Jul 17 2014 08:30:00 GMT+0000', 1405584000, 1405585800, '2015-08-11 04:20:33', 0, 1, 'Vuong Van Truong(M:99999:0) Visit Type: Short Visit Reason:'),
(256, '', 2, 'Thang Nguyen1', 3, 'Manh Thang Nguyen', 'Booked', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 08:30:00 GMT+0000', 'Fri Jul 18 2014 09:00:00 GMT+0000', 1405672200, 1405674000, '2015-08-11 04:20:33', 0, 1, 'Manh Thang Nguyen(M:99999:1905) Visit Type: Short Visit Reason:'),
(257, '', 2, 'Thang Nguyen1', 3, 'Manh Thang Nguyen', 'Booked', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 09:00:00 GMT+0000', 'Fri Jul 18 2014 09:30:00 GMT+0000', 1405674000, 1405675800, '2015-08-11 04:20:33', 0, 1, 'Manh Thang Nguyen(M:99999:1905) Visit Type: Short Visit Reason:'),
(258, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 09:30:00 GMT+0000', 'Fri Jul 18 2014 10:00:00 GMT+0000', 1405675800, 1405677600, '2015-08-11 04:20:33', 0, 0, NULL),
(259, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 10:00:00 GMT+0000', 'Fri Jul 18 2014 10:30:00 GMT+0000', 1405677600, 1405679400, '2015-08-11 04:20:33', 0, 0, NULL),
(260, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 10:30:00 GMT+0000', 'Fri Jul 18 2014 11:00:00 GMT+0000', 1405679400, 1405681200, '2015-08-11 04:20:33', 0, 0, NULL),
(261, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 11:00:00 GMT+0000', 'Fri Jul 18 2014 11:30:00 GMT+0000', 1405681200, 1405683000, '2015-08-11 04:20:33', 0, 0, NULL),
(262, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 11:30:00 GMT+0000', 'Fri Jul 18 2014 12:00:00 GMT+0000', 1405683000, 1405684800, '2015-08-11 04:20:33', 0, 0, NULL),
(263, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 12:00:00 GMT+0000', 'Fri Jul 18 2014 12:30:00 GMT+0000', 1405684800, 1405686600, '2015-08-11 04:20:33', 0, 0, NULL),
(264, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 12:30:00 GMT+0000', 'Fri Jul 18 2014 13:00:00 GMT+0000', 1405686600, 1405688400, '2015-08-11 04:20:33', 0, 0, NULL),
(265, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 13:00:00 GMT+0000', 'Fri Jul 18 2014 13:30:00 GMT+0000', 1405688400, 1405690200, '2015-08-11 04:20:33', 0, 0, NULL),
(266, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 13:30:00 GMT+0000', 'Fri Jul 18 2014 14:00:00 GMT+0000', 1405690200, 1405692000, '2015-08-11 04:20:33', 0, 0, NULL),
(267, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 14:00:00 GMT+0000', 'Fri Jul 18 2014 14:30:00 GMT+0000', 1405692000, 1405693800, '2015-08-11 04:20:33', 0, 0, NULL),
(268, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 14:30:00 GMT+0000', 'Fri Jul 18 2014 15:00:00 GMT+0000', 1405693800, 1405695600, '2015-08-11 04:20:33', 0, 0, NULL),
(269, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 15:00:00 GMT+0000', 'Fri Jul 18 2014 15:30:00 GMT+0000', 1405695600, 1405697400, '2015-08-11 04:20:33', 0, 0, NULL),
(270, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 15:30:00 GMT+0000', 'Fri Jul 18 2014 16:00:00 GMT+0000', 1405697400, 1405699200, '2015-08-11 04:20:33', 0, 0, NULL),
(271, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 16:00:00 GMT+0000', 'Fri Jul 18 2014 16:30:00 GMT+0000', 1405699200, 1405701000, '2015-08-11 04:20:33', 0, 0, NULL),
(272, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 16:30:00 GMT+0000', 'Fri Jul 18 2014 17:00:00 GMT+0000', 1405701000, 1405702800, '2015-08-11 04:20:33', 0, 0, NULL),
(273, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 17:00:00 GMT+0000', 'Fri Jul 18 2014 17:30:00 GMT+0000', 1405702800, 1405704600, '2015-08-11 04:20:33', 0, 0, NULL),
(274, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 17:30:00 GMT+0000', 'Fri Jul 18 2014 18:00:00 GMT+0000', 1405704600, 1405706400, '2015-08-11 04:20:33', 0, 0, NULL),
(275, '', 2, 'Thang Nguyen1', 3, 'Manh Thang Nguyen', 'Booked', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 08:00:00 GMT+0000', 'Fri Jul 18 2014 08:30:00 GMT+0000', 1405670400, 1405672200, '2015-08-11 04:20:33', 0, 1, 'Manh Thang Nguyen(M:99999:1905) Visit Type: Short Visit Reason:'),
(276, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 08:30:00 GMT+0000', 'Sat Jul 19 2014 09:00:00 GMT+0000', 1405758600, 1405760400, '2015-08-11 04:20:33', 0, 0, NULL),
(277, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 09:00:00 GMT+0000', 'Sat Jul 19 2014 09:30:00 GMT+0000', 1405760400, 1405762200, '2015-08-11 04:20:33', 0, 0, NULL),
(278, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 09:30:00 GMT+0000', 'Sat Jul 19 2014 10:00:00 GMT+0000', 1405762200, 1405764000, '2015-08-11 04:20:33', 0, 0, NULL),
(279, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 10:00:00 GMT+0000', 'Sat Jul 19 2014 10:30:00 GMT+0000', 1405764000, 1405765800, '2015-08-11 04:20:33', 0, 0, NULL),
(280, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 10:30:00 GMT+0000', 'Sat Jul 19 2014 11:00:00 GMT+0000', 1405765800, 1405767600, '2015-08-11 04:20:33', 0, 0, NULL),
(281, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 11:00:00 GMT+0000', 'Sat Jul 19 2014 11:30:00 GMT+0000', 1405767600, 1405769400, '2015-08-11 04:20:33', 0, 0, NULL),
(282, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 11:30:00 GMT+0000', 'Sat Jul 19 2014 12:00:00 GMT+0000', 1405769400, 1405771200, '2015-08-11 04:20:33', 0, 0, NULL),
(283, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 12:00:00 GMT+0000', 'Sat Jul 19 2014 12:30:00 GMT+0000', 1405771200, 1405773000, '2015-08-11 04:20:33', 0, 0, NULL),
(284, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 12:30:00 GMT+0000', 'Sat Jul 19 2014 13:00:00 GMT+0000', 1405773000, 1405774800, '2015-08-11 04:20:33', 0, 0, NULL),
(285, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 13:00:00 GMT+0000', 'Sat Jul 19 2014 13:30:00 GMT+0000', 1405774800, 1405776600, '2015-08-11 04:20:33', 0, 0, NULL),
(286, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 13:30:00 GMT+0000', 'Sat Jul 19 2014 14:00:00 GMT+0000', 1405776600, 1405778400, '2015-08-11 04:20:33', 0, 0, NULL),
(287, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 14:00:00 GMT+0000', 'Sat Jul 19 2014 14:30:00 GMT+0000', 1405778400, 1405780200, '2015-08-11 04:20:33', 0, 0, NULL),
(288, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 14:30:00 GMT+0000', 'Sat Jul 19 2014 15:00:00 GMT+0000', 1405780200, 1405782000, '2015-08-11 04:20:33', 0, 0, NULL),
(289, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 15:00:00 GMT+0000', 'Sat Jul 19 2014 15:30:00 GMT+0000', 1405782000, 1405783800, '2015-08-11 04:20:33', 0, 0, NULL),
(290, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 15:30:00 GMT+0000', 'Sat Jul 19 2014 16:00:00 GMT+0000', 1405783800, 1405785600, '2015-08-11 04:20:33', 0, 0, NULL),
(291, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 16:00:00 GMT+0000', 'Sat Jul 19 2014 16:30:00 GMT+0000', 1405785600, 1405787400, '2015-08-11 04:20:33', 0, 0, NULL),
(292, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 16:30:00 GMT+0000', 'Sat Jul 19 2014 17:00:00 GMT+0000', 1405787400, 1405789200, '2015-08-11 04:20:33', 0, 0, NULL),
(293, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 17:00:00 GMT+0000', 'Sat Jul 19 2014 17:30:00 GMT+0000', 1405789200, 1405791000, '2015-08-11 04:20:33', 0, 0, NULL),
(294, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 08:00:00 GMT+0000', 'Sat Jul 19 2014 08:30:00 GMT+0000', 1405756800, 1405758600, '2015-08-11 04:20:33', 0, 1, ''),
(295, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 09:00:00 GMT+0000', 'Tue Jul 15 2014 09:30:00 GMT+0000', 1405414800, 1405416600, '2015-08-11 04:20:33', 0, 0, NULL),
(296, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 09:30:00 GMT+0000', 'Tue Jul 15 2014 10:00:00 GMT+0000', 1405416600, 1405418400, '2015-08-11 04:20:33', 0, 0, NULL),
(297, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 10:00:00 GMT+0000', 'Tue Jul 15 2014 10:30:00 GMT+0000', 1405418400, 1405420200, '2015-08-11 04:20:33', 0, 0, NULL),
(298, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 10:30:00 GMT+0000', 'Tue Jul 15 2014 11:00:00 GMT+0000', 1405420200, 1405422000, '2015-08-11 04:20:33', 0, 0, NULL),
(299, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 11:00:00 GMT+0000', 'Tue Jul 15 2014 11:30:00 GMT+0000', 1405422000, 1405423800, '2015-08-11 04:20:33', 0, 0, NULL),
(300, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 11:30:00 GMT+0000', 'Tue Jul 15 2014 12:00:00 GMT+0000', 1405423800, 1405425600, '2015-08-11 04:20:33', 0, 0, NULL),
(301, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 12:00:00 GMT+0000', 'Tue Jul 15 2014 12:30:00 GMT+0000', 1405425600, 1405427400, '2015-08-11 04:20:33', 0, 0, NULL),
(302, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 12:30:00 GMT+0000', 'Tue Jul 15 2014 13:00:00 GMT+0000', 1405427400, 1405429200, '2015-08-11 04:20:33', 0, 0, NULL),
(303, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 13:00:00 GMT+0000', 'Tue Jul 15 2014 13:30:00 GMT+0000', 1405429200, 1405431000, '2015-08-11 04:20:33', 0, 0, NULL),
(304, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 13:30:00 GMT+0000', 'Tue Jul 15 2014 14:00:00 GMT+0000', 1405431000, 1405432800, '2015-08-11 04:20:33', 0, 0, NULL),
(305, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 14:00:00 GMT+0000', 'Tue Jul 15 2014 14:30:00 GMT+0000', 1405432800, 1405434600, '2015-08-11 04:20:33', 0, 0, NULL),
(306, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 14:30:00 GMT+0000', 'Tue Jul 15 2014 15:00:00 GMT+0000', 1405434600, 1405436400, '2015-08-11 04:20:33', 0, 0, NULL),
(307, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 15:00:00 GMT+0000', 'Tue Jul 15 2014 15:30:00 GMT+0000', 1405436400, 1405438200, '2015-08-11 04:20:33', 0, 0, NULL),
(308, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 15:30:00 GMT+0000', 'Tue Jul 15 2014 16:00:00 GMT+0000', 1405438200, 1405440000, '2015-08-11 04:20:33', 0, 0, NULL),
(309, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 16:00:00 GMT+0000', 'Tue Jul 15 2014 16:30:00 GMT+0000', 1405440000, 1405441800, '2015-08-11 04:20:33', 0, 0, NULL),
(310, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 16:30:00 GMT+0000', 'Tue Jul 15 2014 17:00:00 GMT+0000', 1405441800, 1405443600, '2015-08-11 04:20:33', 0, 0, NULL),
(311, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 08:30:00 GMT+0000', 'Tue Jul 15 2014 09:00:00 GMT+0000', 1405413000, 1405414800, '2015-08-11 04:20:33', 0, 0, NULL),
(312, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 09:00:00 GMT+0000', 'Wed Jul 16 2014 09:30:00 GMT+0000', 1405501200, 1405503000, '2015-08-11 04:20:33', 0, 0, NULL),
(313, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 09:30:00 GMT+0000', 'Wed Jul 16 2014 10:00:00 GMT+0000', 1405503000, 1405504800, '2015-08-11 04:20:33', 0, 0, NULL),
(314, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 10:00:00 GMT+0000', 'Wed Jul 16 2014 10:30:00 GMT+0000', 1405504800, 1405506600, '2015-08-11 04:20:33', 0, 0, NULL),
(315, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 10:30:00 GMT+0000', 'Wed Jul 16 2014 11:00:00 GMT+0000', 1405506600, 1405508400, '2015-08-11 04:20:33', 0, 0, NULL),
(316, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 11:00:00 GMT+0000', 'Wed Jul 16 2014 11:30:00 GMT+0000', 1405508400, 1405510200, '2015-08-11 04:20:33', 0, 0, NULL),
(317, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 11:30:00 GMT+0000', 'Wed Jul 16 2014 12:00:00 GMT+0000', 1405510200, 1405512000, '2015-08-11 04:20:33', 0, 0, NULL),
(318, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 12:00:00 GMT+0000', 'Wed Jul 16 2014 12:30:00 GMT+0000', 1405512000, 1405513800, '2015-08-11 04:20:33', 0, 0, NULL),
(319, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 12:30:00 GMT+0000', 'Wed Jul 16 2014 13:00:00 GMT+0000', 1405513800, 1405515600, '2015-08-11 04:20:33', 0, 0, NULL),
(320, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 13:00:00 GMT+0000', 'Wed Jul 16 2014 13:30:00 GMT+0000', 1405515600, 1405517400, '2015-08-11 04:20:33', 0, 0, NULL),
(321, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 13:30:00 GMT+0000', 'Wed Jul 16 2014 14:00:00 GMT+0000', 1405517400, 1405519200, '2015-08-11 04:20:33', 0, 0, NULL),
(322, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 14:00:00 GMT+0000', 'Wed Jul 16 2014 14:30:00 GMT+0000', 1405519200, 1405521000, '2015-08-11 04:20:33', 0, 0, NULL),
(323, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 14:30:00 GMT+0000', 'Wed Jul 16 2014 15:00:00 GMT+0000', 1405521000, 1405522800, '2015-08-11 04:20:33', 0, 0, NULL),
(324, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 15:00:00 GMT+0000', 'Wed Jul 16 2014 15:30:00 GMT+0000', 1405522800, 1405524600, '2015-08-11 04:20:33', 0, 0, NULL),
(325, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 15:30:00 GMT+0000', 'Wed Jul 16 2014 16:00:00 GMT+0000', 1405524600, 1405526400, '2015-08-11 04:20:33', 0, 0, NULL),
(326, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 16:00:00 GMT+0000', 'Wed Jul 16 2014 16:30:00 GMT+0000', 1405526400, 1405528200, '2015-08-11 04:20:33', 0, 0, NULL),
(327, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 16:30:00 GMT+0000', 'Wed Jul 16 2014 17:00:00 GMT+0000', 1405528200, 1405530000, '2015-08-11 04:20:33', 0, 0, NULL),
(328, '', 2, 'Thang Nguyen1', 25, 'Dao Thanh Tuyen', 'Booked', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 08:30:00 GMT+0000', 'Wed Jul 16 2014 09:00:00 GMT+0000', 1405499400, 1405501200, '2015-08-11 04:20:33', 0, 1, 'Dao Thanh Tuyen(M:84911233452:1988) Visit Type: Short Visit Reason:'),
(329, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 09:00:00 GMT+0000', 'Mon Jul 14 2014 09:30:00 GMT+0000', 1405328400, 1405330200, '2015-08-11 04:20:33', 0, 0, NULL),
(330, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 09:30:00 GMT+0000', 'Mon Jul 14 2014 10:00:00 GMT+0000', 1405330200, 1405332000, '2015-08-11 04:20:33', 0, 0, NULL),
(331, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 10:00:00 GMT+0000', 'Mon Jul 14 2014 10:30:00 GMT+0000', 1405332000, 1405333800, '2015-08-11 04:20:33', 0, 0, NULL),
(332, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 10:30:00 GMT+0000', 'Mon Jul 14 2014 11:00:00 GMT+0000', 1405333800, 1405335600, '2015-08-11 04:20:33', 0, 0, NULL),
(333, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 11:00:00 GMT+0000', 'Mon Jul 14 2014 11:30:00 GMT+0000', 1405335600, 1405337400, '2015-08-11 04:20:33', 0, 0, NULL),
(334, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 11:30:00 GMT+0000', 'Mon Jul 14 2014 12:00:00 GMT+0000', 1405337400, 1405339200, '2015-08-11 04:20:33', 0, 0, NULL),
(335, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 12:00:00 GMT+0000', 'Mon Jul 14 2014 12:30:00 GMT+0000', 1405339200, 1405341000, '2015-08-11 04:20:33', 0, 0, NULL),
(336, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 12:30:00 GMT+0000', 'Mon Jul 14 2014 13:00:00 GMT+0000', 1405341000, 1405342800, '2015-08-11 04:20:33', 0, 0, NULL),
(337, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 13:00:00 GMT+0000', 'Mon Jul 14 2014 13:30:00 GMT+0000', 1405342800, 1405344600, '2015-08-11 04:20:33', 0, 0, NULL),
(338, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 13:30:00 GMT+0000', 'Mon Jul 14 2014 14:00:00 GMT+0000', 1405344600, 1405346400, '2015-08-11 04:20:33', 0, 0, NULL),
(339, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 14:00:00 GMT+0000', 'Mon Jul 14 2014 14:30:00 GMT+0000', 1405346400, 1405348200, '2015-08-11 04:20:33', 0, 0, NULL),
(340, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 14:30:00 GMT+0000', 'Mon Jul 14 2014 15:00:00 GMT+0000', 1405348200, 1405350000, '2015-08-11 04:20:33', 0, 0, NULL),
(341, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 15:00:00 GMT+0000', 'Mon Jul 14 2014 15:30:00 GMT+0000', 1405350000, 1405351800, '2015-08-11 04:20:33', 0, 0, NULL),
(342, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 15:30:00 GMT+0000', 'Mon Jul 14 2014 16:00:00 GMT+0000', 1405351800, 1405353600, '2015-08-11 04:20:33', 0, 0, NULL),
(343, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 08:30:00 GMT+0000', 'Mon Jul 14 2014 09:00:00 GMT+0000', 1405326600, 1405328400, '2015-08-11 04:20:33', 0, 0, NULL),
(344, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 09:00:00 GMT+0000', 'Sun Jul 13 2014 09:30:00 GMT+0000', 1405242000, 1405243800, '2015-08-11 04:20:33', 0, 0, NULL),
(345, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 09:30:00 GMT+0000', 'Sun Jul 13 2014 10:00:00 GMT+0000', 1405243800, 1405245600, '2015-08-11 04:20:33', 0, 0, NULL),
(346, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 10:00:00 GMT+0000', 'Sun Jul 13 2014 10:30:00 GMT+0000', 1405245600, 1405247400, '2015-08-11 04:20:33', 0, 0, NULL),
(347, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 10:30:00 GMT+0000', 'Sun Jul 13 2014 11:00:00 GMT+0000', 1405247400, 1405249200, '2015-08-11 04:20:33', 0, 0, NULL),
(348, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 11:00:00 GMT+0000', 'Sun Jul 13 2014 11:30:00 GMT+0000', 1405249200, 1405251000, '2015-08-11 04:20:33', 0, 0, NULL),
(349, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 11:30:00 GMT+0000', 'Sun Jul 13 2014 12:00:00 GMT+0000', 1405251000, 1405252800, '2015-08-11 04:20:33', 0, 0, NULL),
(350, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 12:00:00 GMT+0000', 'Sun Jul 13 2014 12:30:00 GMT+0000', 1405252800, 1405254600, '2015-08-11 04:20:33', 0, 0, NULL),
(351, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 12:30:00 GMT+0000', 'Sun Jul 13 2014 13:00:00 GMT+0000', 1405254600, 1405256400, '2015-08-11 04:20:33', 0, 0, NULL),
(352, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 13:00:00 GMT+0000', 'Sun Jul 13 2014 13:30:00 GMT+0000', 1405256400, 1405258200, '2015-08-11 04:20:33', 0, 0, NULL),
(353, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 13:30:00 GMT+0000', 'Sun Jul 13 2014 14:00:00 GMT+0000', 1405258200, 1405260000, '2015-08-11 04:20:33', 0, 0, NULL),
(354, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 14:00:00 GMT+0000', 'Sun Jul 13 2014 14:30:00 GMT+0000', 1405260000, 1405261800, '2015-08-11 04:20:33', 0, 0, NULL),
(355, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 14:30:00 GMT+0000', 'Sun Jul 13 2014 15:00:00 GMT+0000', 1405261800, 1405263600, '2015-08-11 04:20:33', 0, 0, NULL),
(356, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 15:00:00 GMT+0000', 'Sun Jul 13 2014 15:30:00 GMT+0000', 1405263600, 1405265400, '2015-08-11 04:20:33', 0, 0, NULL),
(357, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 08:30:00 GMT+0000', 'Sun Jul 13 2014 09:00:00 GMT+0000', 1405240200, 1405242000, '2015-08-11 04:20:33', 0, 0, NULL),
(358, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 09:30:00 GMT+0000', 'Thu Jul 17 2014 10:00:00 GMT+0000', 1405589400, 1405591200, '2015-08-11 04:20:33', 0, 0, NULL),
(359, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 10:00:00 GMT+0000', 'Thu Jul 17 2014 10:30:00 GMT+0000', 1405591200, 1405593000, '2015-08-11 04:20:33', 0, 0, NULL),
(360, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 10:30:00 GMT+0000', 'Thu Jul 17 2014 11:00:00 GMT+0000', 1405593000, 1405594800, '2015-08-11 04:20:33', 0, 0, NULL),
(361, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 11:00:00 GMT+0000', 'Thu Jul 17 2014 11:30:00 GMT+0000', 1405594800, 1405596600, '2015-08-11 04:20:33', 0, 0, NULL),
(362, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 11:30:00 GMT+0000', 'Thu Jul 17 2014 12:00:00 GMT+0000', 1405596600, 1405598400, '2015-08-11 04:20:33', 0, 0, NULL),
(363, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 12:00:00 GMT+0000', 'Thu Jul 17 2014 12:30:00 GMT+0000', 1405598400, 1405600200, '2015-08-11 04:20:33', 0, 0, NULL),
(364, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 12:30:00 GMT+0000', 'Thu Jul 17 2014 13:00:00 GMT+0000', 1405600200, 1405602000, '2015-08-11 04:20:33', 0, 0, NULL),
(365, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 13:00:00 GMT+0000', 'Thu Jul 17 2014 13:30:00 GMT+0000', 1405602000, 1405603800, '2015-08-11 04:20:33', 0, 0, NULL),
(366, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 13:30:00 GMT+0000', 'Thu Jul 17 2014 14:00:00 GMT+0000', 1405603800, 1405605600, '2015-08-11 04:20:33', 0, 0, NULL),
(367, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 14:00:00 GMT+0000', 'Thu Jul 17 2014 14:30:00 GMT+0000', 1405605600, 1405607400, '2015-08-11 04:20:33', 0, 0, NULL),
(368, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 14:30:00 GMT+0000', 'Thu Jul 17 2014 15:00:00 GMT+0000', 1405607400, 1405609200, '2015-08-11 04:20:33', 0, 0, NULL),
(369, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 15:00:00 GMT+0000', 'Thu Jul 17 2014 15:30:00 GMT+0000', 1405609200, 1405611000, '2015-08-11 04:20:33', 0, 0, NULL),
(370, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 15:30:00 GMT+0000', 'Thu Jul 17 2014 16:00:00 GMT+0000', 1405611000, 1405612800, '2015-08-11 04:20:33', 0, 0, NULL),
(371, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 16:00:00 GMT+0000', 'Thu Jul 17 2014 16:30:00 GMT+0000', 1405612800, 1405614600, '2015-08-11 04:20:33', 0, 0, NULL),
(372, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 16:30:00 GMT+0000', 'Thu Jul 17 2014 17:00:00 GMT+0000', 1405614600, 1405616400, '2015-08-11 04:20:33', 0, 0, NULL),
(373, '', 2, 'Thang Nguyen1', 3, 'Manh Thang Nguyen', 'Booked', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 09:00:00 GMT+0000', 'Thu Jul 17 2014 09:30:00 GMT+0000', 1405587600, 1405589400, '2015-08-11 04:20:33', 0, 1, 'Manh Thang Nguyen(M:99999:1905) Visit Type: Short Visit Reason:'),
(374, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 09:00:00 GMT+0000', 'Fri Jul 18 2014 09:30:00 GMT+0000', 1405674000, 1405675800, '2015-08-11 04:20:33', 0, 0, NULL),
(375, '', 2, 'Thang Nguyen1', 3, 'Manh Thang Nguyen', 'Booked', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 08:30:00 GMT+0000', 'Fri Jul 18 2014 09:00:00 GMT+0000', 1405672200, 1405674000, '2015-08-11 04:20:33', 0, 1, 'Manh Thang Nguyen(M:99999:1905) Visit Type: Short Visit Reason:'),
(376, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 08:30:00 GMT+0000', 'Wed Jul 23 2014 09:00:00 GMT+0000', 1406104200, 1406106000, '2015-08-11 04:20:33', 0, 1, ''),
(377, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 09:00:00 GMT+0000', 'Wed Jul 23 2014 09:30:00 GMT+0000', 1406106000, 1406107800, '2015-08-11 04:20:33', 0, 1, ''),
(378, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 09:30:00 GMT+0000', 'Wed Jul 23 2014 10:00:00 GMT+0000', 1406107800, 1406109600, '2015-08-11 04:20:33', 0, 0, NULL),
(379, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 10:00:00 GMT+0000', 'Wed Jul 23 2014 10:30:00 GMT+0000', 1406109600, 1406111400, '2015-08-11 04:20:33', 0, 0, NULL),
(380, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 10:30:00 GMT+0000', 'Wed Jul 23 2014 11:00:00 GMT+0000', 1406111400, 1406113200, '2015-08-11 04:20:33', 0, 0, NULL),
(381, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 11:00:00 GMT+0000', 'Wed Jul 23 2014 11:30:00 GMT+0000', 1406113200, 1406115000, '2015-08-11 04:20:33', 0, 0, NULL),
(382, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 11:30:00 GMT+0000', 'Wed Jul 23 2014 12:00:00 GMT+0000', 1406115000, 1406116800, '2015-08-11 04:20:33', 0, 0, NULL),
(383, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 12:00:00 GMT+0000', 'Wed Jul 23 2014 12:30:00 GMT+0000', 1406116800, 1406118600, '2015-08-11 04:20:33', 0, 0, NULL),
(384, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 12:30:00 GMT+0000', 'Wed Jul 23 2014 13:00:00 GMT+0000', 1406118600, 1406120400, '2015-08-11 04:20:33', 0, 0, NULL),
(385, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 13:00:00 GMT+0000', 'Wed Jul 23 2014 13:30:00 GMT+0000', 1406120400, 1406122200, '2015-08-11 04:20:33', 0, 0, NULL),
(386, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 13:30:00 GMT+0000', 'Wed Jul 23 2014 14:00:00 GMT+0000', 1406122200, 1406124000, '2015-08-11 04:20:33', 0, 0, NULL),
(387, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 14:00:00 GMT+0000', 'Wed Jul 23 2014 14:30:00 GMT+0000', 1406124000, 1406125800, '2015-08-11 04:20:33', 0, 0, NULL),
(388, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 14:30:00 GMT+0000', 'Wed Jul 23 2014 15:00:00 GMT+0000', 1406125800, 1406127600, '2015-08-11 04:20:33', 0, 0, NULL),
(389, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 08:00:00 GMT+0000', 'Wed Jul 23 2014 08:30:00 GMT+0000', 1406102400, 1406104200, '2015-08-11 04:20:33', 0, 1, ''),
(390, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 10:30:00 GMT+0000', 'Fri Jul 18 2014 11:00:00 GMT+0000', 1405679400, 1405681200, '2015-08-11 04:20:33', 0, 0, NULL),
(391, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 11:00:00 GMT+0000', 'Fri Jul 18 2014 11:30:00 GMT+0000', 1405681200, 1405683000, '2015-08-11 04:20:33', 0, 0, NULL),
(392, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 11:30:00 GMT+0000', 'Fri Jul 18 2014 12:00:00 GMT+0000', 1405683000, 1405684800, '2015-08-11 04:20:33', 0, 0, NULL),
(393, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 12:00:00 GMT+0000', 'Fri Jul 18 2014 12:30:00 GMT+0000', 1405684800, 1405686600, '2015-08-11 04:20:33', 0, 0, NULL),
(394, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 12:30:00 GMT+0000', 'Fri Jul 18 2014 13:00:00 GMT+0000', 1405686600, 1405688400, '2015-08-11 04:20:33', 0, 0, NULL),
(395, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 10:00:00 GMT+0000', 'Fri Jul 18 2014 10:30:00 GMT+0000', 1405677600, 1405679400, '2015-08-11 04:20:33', 0, 0, NULL),
(396, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 14:30:00 GMT+0000', 'Fri Jul 18 2014 15:00:00 GMT+0000', 1405693800, 1405695600, '2015-08-11 04:20:33', 0, 0, NULL),
(397, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 09:30:00 GMT+0000', 'Sat Jul 19 2014 10:00:00 GMT+0000', 1405762200, 1405764000, '2015-08-11 04:20:33', 0, 0, NULL),
(398, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 10:00:00 GMT+0000', 'Sat Jul 19 2014 10:30:00 GMT+0000', 1405764000, 1405765800, '2015-08-11 04:20:33', 0, 0, NULL),
(399, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 10:30:00 GMT+0000', 'Sat Jul 19 2014 11:00:00 GMT+0000', 1405765800, 1405767600, '2015-08-11 04:20:33', 0, 0, NULL),
(400, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 11:00:00 GMT+0000', 'Sat Jul 19 2014 11:30:00 GMT+0000', 1405767600, 1405769400, '2015-08-11 04:20:33', 0, 0, NULL),
(401, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 11:30:00 GMT+0000', 'Sat Jul 19 2014 12:00:00 GMT+0000', 1405769400, 1405771200, '2015-08-11 04:20:33', 0, 0, NULL),
(402, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 12:00:00 GMT+0000', 'Sat Jul 19 2014 12:30:00 GMT+0000', 1405771200, 1405773000, '2015-08-11 04:20:33', 0, 0, NULL),
(403, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 12:30:00 GMT+0000', 'Sat Jul 19 2014 13:00:00 GMT+0000', 1405773000, 1405774800, '2015-08-11 04:20:33', 0, 0, NULL),
(404, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 13:00:00 GMT+0000', 'Sat Jul 19 2014 13:30:00 GMT+0000', 1405774800, 1405776600, '2015-08-11 04:20:33', 0, 0, NULL),
(405, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 13:30:00 GMT+0000', 'Sat Jul 19 2014 14:00:00 GMT+0000', 1405776600, 1405778400, '2015-08-11 04:20:33', 0, 0, NULL),
(406, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 14:00:00 GMT+0000', 'Sat Jul 19 2014 14:30:00 GMT+0000', 1405778400, 1405780200, '2015-08-11 04:20:33', 0, 1, ''),
(407, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 14:30:00 GMT+0000', 'Sat Jul 19 2014 15:00:00 GMT+0000', 1405780200, 1405782000, '2015-08-11 04:20:33', 0, 0, NULL),
(408, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 15:00:00 GMT+0000', 'Sat Jul 19 2014 15:30:00 GMT+0000', 1405782000, 1405783800, '2015-08-11 04:20:33', 0, 0, NULL),
(409, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 15:30:00 GMT+0000', 'Sat Jul 19 2014 16:00:00 GMT+0000', 1405783800, 1405785600, '2015-08-11 04:20:33', 0, 0, NULL),
(410, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 16:00:00 GMT+0000', 'Sat Jul 19 2014 16:30:00 GMT+0000', 1405785600, 1405787400, '2015-08-11 04:20:33', 0, 0, NULL),
(411, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 16:30:00 GMT+0000', 'Sat Jul 19 2014 17:00:00 GMT+0000', 1405787400, 1405789200, '2015-08-11 04:20:33', 0, 0, NULL),
(412, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 17:00:00 GMT+0000', 'Sat Jul 19 2014 17:30:00 GMT+0000', 1405789200, 1405791000, '2015-08-11 04:20:33', 0, 0, NULL),
(413, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 09:00:00 GMT+0000', 'Sat Jul 19 2014 09:30:00 GMT+0000', 1405760400, 1405762200, '2015-08-11 04:20:33', 0, 0, NULL),
(414, '', 2, 'See Yunn 1', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Fri Jul 18 2014 10:00:00 GMT+0000', 'Fri Jul 18 2014 10:30:00 GMT+0000', 1405677600, 1405679400, '2015-08-11 04:20:33', 0, 1, ''),
(415, '', 2, 'See Yunn 1', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Fri Jul 18 2014 10:30:00 GMT+0000', 'Fri Jul 18 2014 11:00:00 GMT+0000', 1405679400, 1405681200, '2015-08-11 04:20:33', 0, 0, NULL),
(416, '', 2, 'See Yunn 1', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Fri Jul 18 2014 09:30:00 GMT+0000', 'Fri Jul 18 2014 10:00:00 GMT+0000', 1405675800, 1405677600, '2015-08-11 04:20:33', 0, 0, NULL),
(417, '', 2, 'See Yunn 1', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Fri Jul 18 2014 11:30:00 GMT+0000', 'Fri Jul 18 2014 12:00:00 GMT+0000', 1405683000, 1405684800, '2015-08-11 04:20:33', 0, 0, NULL),
(418, '', 2, 'See Yunn 1', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Fri Jul 18 2014 12:00:00 GMT+0000', 'Fri Jul 18 2014 12:30:00 GMT+0000', 1405684800, 1405686600, '2015-08-11 04:20:33', 0, 0, NULL),
(420, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 09:30:00 GMT+0000', 'Tue Jul 15 2014 10:00:00 GMT+0000', 1405416600, 1405418400, '2015-08-11 04:20:33', 0, 0, NULL),
(421, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 10:00:00 GMT+0000', 'Tue Jul 15 2014 10:30:00 GMT+0000', 1405418400, 1405420200, '2015-08-11 04:20:33', 0, 0, NULL),
(422, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 10:30:00 GMT+0000', 'Tue Jul 15 2014 11:00:00 GMT+0000', 1405420200, 1405422000, '2015-08-11 04:20:33', 0, 0, NULL),
(423, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 11:00:00 GMT+0000', 'Tue Jul 15 2014 11:30:00 GMT+0000', 1405422000, 1405423800, '2015-08-11 04:20:33', 0, 0, NULL),
(424, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 11:30:00 GMT+0000', 'Tue Jul 15 2014 12:00:00 GMT+0000', 1405423800, 1405425600, '2015-08-11 04:20:33', 0, 0, NULL),
(425, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 12:00:00 GMT+0000', 'Tue Jul 15 2014 12:30:00 GMT+0000', 1405425600, 1405427400, '2015-08-11 04:20:33', 0, 0, NULL),
(426, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 12:30:00 GMT+0000', 'Tue Jul 15 2014 13:00:00 GMT+0000', 1405427400, 1405429200, '2015-08-11 04:20:33', 0, 0, NULL),
(427, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 13:00:00 GMT+0000', 'Tue Jul 15 2014 13:30:00 GMT+0000', 1405429200, 1405431000, '2015-08-11 04:20:33', 0, 0, NULL),
(428, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 13:30:00 GMT+0000', 'Tue Jul 15 2014 14:00:00 GMT+0000', 1405431000, 1405432800, '2015-08-11 04:20:33', 0, 0, NULL),
(429, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 14:00:00 GMT+0000', 'Tue Jul 15 2014 14:30:00 GMT+0000', 1405432800, 1405434600, '2015-08-11 04:20:33', 0, 0, NULL),
(430, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 14:30:00 GMT+0000', 'Tue Jul 15 2014 15:00:00 GMT+0000', 1405434600, 1405436400, '2015-08-11 04:20:33', 0, 0, NULL),
(431, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 15:00:00 GMT+0000', 'Tue Jul 15 2014 15:30:00 GMT+0000', 1405436400, 1405438200, '2015-08-11 04:20:33', 0, 0, NULL),
(432, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 15:30:00 GMT+0000', 'Tue Jul 15 2014 16:00:00 GMT+0000', 1405438200, 1405440000, '2015-08-11 04:20:33', 0, 0, NULL),
(433, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 09:00:00 GMT+0000', 'Tue Jul 15 2014 09:30:00 GMT+0000', 1405414800, 1405416600, '2015-08-11 04:20:33', 0, 0, NULL),
(434, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 10:00:00 GMT+0000', 'Wed Jul 16 2014 10:30:00 GMT+0000', 1405504800, 1405506600, '2015-08-11 04:20:33', 0, 0, NULL),
(435, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 10:30:00 GMT+0000', 'Wed Jul 16 2014 11:00:00 GMT+0000', 1405506600, 1405508400, '2015-08-11 04:20:33', 0, 0, NULL),
(436, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 11:00:00 GMT+0000', 'Wed Jul 16 2014 11:30:00 GMT+0000', 1405508400, 1405510200, '2015-08-11 04:20:33', 0, 0, NULL),
(437, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 11:30:00 GMT+0000', 'Wed Jul 16 2014 12:00:00 GMT+0000', 1405510200, 1405512000, '2015-08-11 04:20:33', 0, 0, NULL),
(438, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 12:00:00 GMT+0000', 'Wed Jul 16 2014 12:30:00 GMT+0000', 1405512000, 1405513800, '2015-08-11 04:20:33', 0, 0, NULL),
(439, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 12:30:00 GMT+0000', 'Wed Jul 16 2014 13:00:00 GMT+0000', 1405513800, 1405515600, '2015-08-11 04:20:33', 0, 0, NULL),
(440, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 13:00:00 GMT+0000', 'Wed Jul 16 2014 13:30:00 GMT+0000', 1405515600, 1405517400, '2015-08-11 04:20:33', 0, 0, NULL),
(441, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 13:30:00 GMT+0000', 'Wed Jul 16 2014 14:00:00 GMT+0000', 1405517400, 1405519200, '2015-08-11 04:20:33', 0, 0, NULL),
(442, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 14:00:00 GMT+0000', 'Wed Jul 16 2014 14:30:00 GMT+0000', 1405519200, 1405521000, '2015-08-11 04:20:33', 0, 0, NULL),
(443, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 14:30:00 GMT+0000', 'Wed Jul 16 2014 15:00:00 GMT+0000', 1405521000, 1405522800, '2015-08-11 04:20:33', 0, 0, NULL),
(444, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 15:00:00 GMT+0000', 'Wed Jul 16 2014 15:30:00 GMT+0000', 1405522800, 1405524600, '2015-08-11 04:20:33', 0, 0, NULL),
(445, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 15:30:00 GMT+0000', 'Wed Jul 16 2014 16:00:00 GMT+0000', 1405524600, 1405526400, '2015-08-11 04:20:33', 0, 0, NULL),
(446, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 09:30:00 GMT+0000', 'Wed Jul 16 2014 10:00:00 GMT+0000', 1405503000, 1405504800, '2015-08-11 04:20:33', 0, 0, NULL),
(447, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 10:00:00 GMT+0000', 'Mon Jul 14 2014 10:30:00 GMT+0000', 1405332000, 1405333800, '2015-08-11 04:20:33', 0, 0, NULL),
(448, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 10:30:00 GMT+0000', 'Mon Jul 14 2014 11:00:00 GMT+0000', 1405333800, 1405335600, '2015-08-11 04:20:33', 0, 0, NULL),
(449, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 11:00:00 GMT+0000', 'Mon Jul 14 2014 11:30:00 GMT+0000', 1405335600, 1405337400, '2015-08-11 04:20:33', 0, 0, NULL),
(450, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 11:30:00 GMT+0000', 'Mon Jul 14 2014 12:00:00 GMT+0000', 1405337400, 1405339200, '2015-08-11 04:20:33', 0, 0, NULL),
(451, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 12:00:00 GMT+0000', 'Mon Jul 14 2014 12:30:00 GMT+0000', 1405339200, 1405341000, '2015-08-11 04:20:33', 0, 0, NULL),
(452, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 12:30:00 GMT+0000', 'Mon Jul 14 2014 13:00:00 GMT+0000', 1405341000, 1405342800, '2015-08-11 04:20:33', 0, 0, NULL),
(453, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 13:00:00 GMT+0000', 'Mon Jul 14 2014 13:30:00 GMT+0000', 1405342800, 1405344600, '2015-08-11 04:20:33', 0, 0, NULL),
(454, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 13:30:00 GMT+0000', 'Mon Jul 14 2014 14:00:00 GMT+0000', 1405344600, 1405346400, '2015-08-11 04:20:33', 0, 0, NULL),
(455, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 14:00:00 GMT+0000', 'Mon Jul 14 2014 14:30:00 GMT+0000', 1405346400, 1405348200, '2015-08-11 04:20:33', 0, 0, NULL),
(456, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 09:30:00 GMT+0000', 'Mon Jul 14 2014 10:00:00 GMT+0000', 1405330200, 1405332000, '2015-08-11 04:20:33', 0, 0, NULL),
(457, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 15:30:00 GMT+0000', 'Mon Jul 14 2014 16:00:00 GMT+0000', 1405351800, 1405353600, '2015-08-11 04:20:33', 0, 0, NULL),
(458, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 16:00:00 GMT+0000', 'Mon Jul 14 2014 16:30:00 GMT+0000', 1405353600, 1405355400, '2015-08-11 04:20:33', 0, 0, NULL),
(459, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 16:30:00 GMT+0000', 'Mon Jul 14 2014 17:00:00 GMT+0000', 1405355400, 1405357200, '2015-08-11 04:20:33', 0, 0, NULL),
(460, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 17:00:00 GMT+0000', 'Mon Jul 14 2014 17:30:00 GMT+0000', 1405357200, 1405359000, '2015-08-11 04:20:33', 0, 0, NULL),
(461, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 15:00:00 GMT+0000', 'Mon Jul 14 2014 15:30:00 GMT+0000', 1405350000, 1405351800, '2015-08-11 04:20:33', 0, 0, NULL),
(462, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 10:00:00 GMT+0000', 'Sun Jul 13 2014 10:30:00 GMT+0000', 1405245600, 1405247400, '2015-08-11 04:20:33', 0, 0, NULL),
(463, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 10:30:00 GMT+0000', 'Sun Jul 13 2014 11:00:00 GMT+0000', 1405247400, 1405249200, '2015-08-11 04:20:33', 0, 0, NULL),
(464, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 11:00:00 GMT+0000', 'Sun Jul 13 2014 11:30:00 GMT+0000', 1405249200, 1405251000, '2015-08-11 04:20:33', 0, 0, NULL),
(465, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 11:30:00 GMT+0000', 'Sun Jul 13 2014 12:00:00 GMT+0000', 1405251000, 1405252800, '2015-08-11 04:20:33', 0, 0, NULL),
(466, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 12:00:00 GMT+0000', 'Sun Jul 13 2014 12:30:00 GMT+0000', 1405252800, 1405254600, '2015-08-11 04:20:33', 0, 0, NULL);
INSERT INTO `tbl_events` (`id`, `reason`, `doctor_id`, `doctor_name`, `cust_id`, `cust_name`, `status`, `clinic_id`, `clinic_name`, `clinic_address`, `start`, `end`, `start_tick`, `end_tick`, `custBookTimeStamp`, `appointment_type`, `visit_type`, `info`) VALUES
(467, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 12:30:00 GMT+0000', 'Sun Jul 13 2014 13:00:00 GMT+0000', 1405254600, 1405256400, '2015-08-11 04:20:33', 0, 0, NULL),
(468, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 13:00:00 GMT+0000', 'Sun Jul 13 2014 13:30:00 GMT+0000', 1405256400, 1405258200, '2015-08-11 04:20:33', 0, 0, NULL),
(469, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 13:30:00 GMT+0000', 'Sun Jul 13 2014 14:00:00 GMT+0000', 1405258200, 1405260000, '2015-08-11 04:20:33', 0, 0, NULL),
(470, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 09:30:00 GMT+0000', 'Sun Jul 13 2014 10:00:00 GMT+0000', 1405243800, 1405245600, '2015-08-11 04:20:33', 0, 0, NULL),
(471, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 15:30:00 GMT+0000', 'Sun Jul 13 2014 16:00:00 GMT+0000', 1405265400, 1405267200, '2015-08-11 04:20:33', 0, 0, NULL),
(472, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 16:00:00 GMT+0000', 'Sun Jul 13 2014 16:30:00 GMT+0000', 1405267200, 1405269000, '2015-08-11 04:20:33', 0, 0, NULL),
(473, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 16:30:00 GMT+0000', 'Sun Jul 13 2014 17:00:00 GMT+0000', 1405269000, 1405270800, '2015-08-11 04:20:33', 0, 0, NULL),
(474, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 17:00:00 GMT+0000', 'Sun Jul 13 2014 17:30:00 GMT+0000', 1405270800, 1405272600, '2015-08-11 04:20:33', 0, 0, NULL),
(475, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 15:00:00 GMT+0000', 'Sun Jul 13 2014 15:30:00 GMT+0000', 1405263600, 1405265400, '2015-08-11 04:20:33', 0, 0, NULL),
(476, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 08:30:00 GMT+0000', 'Sun Jul 13 2014 09:00:00 GMT+0000', 1405240200, 1405242000, '2015-08-11 04:20:33', 0, 0, NULL),
(477, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sun Jul 13 2014 08:00:00 GMT+0000', 'Sun Jul 13 2014 08:30:00 GMT+0000', 1405238400, 1405240200, '2015-08-11 04:20:33', 0, 0, NULL),
(478, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 08:30:00 GMT+0000', 'Mon Jul 14 2014 09:00:00 GMT+0000', 1405326600, 1405328400, '2015-08-11 04:20:33', 0, 0, NULL),
(479, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 08:00:00 GMT+0000', 'Mon Jul 14 2014 08:30:00 GMT+0000', 1405324800, 1405326600, '2015-08-11 04:20:33', 0, 0, NULL),
(480, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 09:00:00 GMT+0000', 'Thu Jul 17 2014 09:30:00 GMT+0000', 1405587600, 1405589400, '2015-08-11 04:20:33', 0, 0, NULL),
(481, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 09:30:00 GMT+0000', 'Thu Jul 17 2014 10:00:00 GMT+0000', 1405589400, 1405591200, '2015-08-11 04:20:33', 0, 0, NULL),
(482, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 10:00:00 GMT+0000', 'Thu Jul 17 2014 10:30:00 GMT+0000', 1405591200, 1405593000, '2015-08-11 04:20:33', 0, 0, NULL),
(483, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 10:30:00 GMT+0000', 'Thu Jul 17 2014 11:00:00 GMT+0000', 1405593000, 1405594800, '2015-08-11 04:20:33', 0, 0, NULL),
(484, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 11:00:00 GMT+0000', 'Thu Jul 17 2014 11:30:00 GMT+0000', 1405594800, 1405596600, '2015-08-11 04:20:33', 0, 0, NULL),
(485, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 11:30:00 GMT+0000', 'Thu Jul 17 2014 12:00:00 GMT+0000', 1405596600, 1405598400, '2015-08-11 04:20:33', 0, 0, NULL),
(486, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 12:00:00 GMT+0000', 'Thu Jul 17 2014 12:30:00 GMT+0000', 1405598400, 1405600200, '2015-08-11 04:20:33', 0, 0, NULL),
(487, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 12:30:00 GMT+0000', 'Thu Jul 17 2014 13:00:00 GMT+0000', 1405600200, 1405602000, '2015-08-11 04:20:33', 0, 0, NULL),
(488, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 13:00:00 GMT+0000', 'Thu Jul 17 2014 13:30:00 GMT+0000', 1405602000, 1405603800, '2015-08-11 04:20:33', 0, 0, NULL),
(489, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 13:30:00 GMT+0000', 'Thu Jul 17 2014 14:00:00 GMT+0000', 1405603800, 1405605600, '2015-08-11 04:20:33', 0, 0, NULL),
(490, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 14:00:00 GMT+0000', 'Thu Jul 17 2014 14:30:00 GMT+0000', 1405605600, 1405607400, '2015-08-11 04:20:33', 0, 0, NULL),
(491, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 14:30:00 GMT+0000', 'Thu Jul 17 2014 15:00:00 GMT+0000', 1405607400, 1405609200, '2015-08-11 04:20:33', 0, 0, NULL),
(492, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 15:00:00 GMT+0000', 'Thu Jul 17 2014 15:30:00 GMT+0000', 1405609200, 1405611000, '2015-08-11 04:20:33', 0, 0, NULL),
(493, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 15:30:00 GMT+0000', 'Thu Jul 17 2014 16:00:00 GMT+0000', 1405611000, 1405612800, '2015-08-11 04:20:33', 0, 0, NULL),
(494, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 16:00:00 GMT+0000', 'Thu Jul 17 2014 16:30:00 GMT+0000', 1405612800, 1405614600, '2015-08-11 04:20:33', 0, 0, NULL),
(495, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 16:30:00 GMT+0000', 'Thu Jul 17 2014 17:00:00 GMT+0000', 1405614600, 1405616400, '2015-08-11 04:20:33', 0, 0, NULL),
(496, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 17:00:00 GMT+0000', 'Thu Jul 17 2014 17:30:00 GMT+0000', 1405616400, 1405618200, '2015-08-11 04:20:33', 0, 0, NULL),
(497, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 17 2014 08:30:00 GMT+0000', 'Thu Jul 17 2014 09:00:00 GMT+0000', 1405585800, 1405587600, '2015-08-11 04:20:33', 0, 0, NULL),
(498, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 09:00:00 GMT+0000', 'Wed Jul 23 2014 09:30:00 GMT+0000', 1406106000, 1406107800, '2015-08-11 04:20:33', 0, 0, NULL),
(499, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 09:30:00 GMT+0000', 'Wed Jul 23 2014 10:00:00 GMT+0000', 1406107800, 1406109600, '2015-08-11 04:20:33', 0, 0, NULL),
(500, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 10:00:00 GMT+0000', 'Wed Jul 23 2014 10:30:00 GMT+0000', 1406109600, 1406111400, '2015-08-11 04:20:33', 0, 0, NULL),
(501, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 23 2014 08:30:00 GMT+0000', 'Wed Jul 23 2014 09:00:00 GMT+0000', 1406104200, 1406106000, '2015-08-11 04:20:33', 0, 0, NULL),
(502, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 08:00:00 GMT+0000', 'Thu Jul 24 2014 08:30:00 GMT+0000', 1406188800, 1406190600, '2015-08-11 04:20:33', 0, 0, NULL),
(503, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 14:30:00 GMT+0000', 'Thu Jul 24 2014 15:00:00 GMT+0000', 1406212200, 1406214000, '2015-08-11 04:20:33', 0, 0, NULL),
(504, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 09:30:00 GMT+0000', 'Thu Jul 24 2014 10:00:00 GMT+0000', 1406194200, 1406196000, '2015-08-11 04:20:33', 0, 0, NULL),
(505, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 10:00:00 GMT+0000', 'Thu Jul 24 2014 10:30:00 GMT+0000', 1406196000, 1406197800, '2015-08-11 04:20:33', 0, 1, ''),
(506, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 10:30:00 GMT+0000', 'Thu Jul 24 2014 11:00:00 GMT+0000', 1406197800, 1406199600, '2015-08-11 04:20:33', 0, 0, NULL),
(507, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 11:00:00 GMT+0000', 'Thu Jul 24 2014 11:30:00 GMT+0000', 1406199600, 1406201400, '2015-08-11 04:20:33', 0, 0, NULL),
(508, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 11:30:00 GMT+0000', 'Thu Jul 24 2014 12:00:00 GMT+0000', 1406201400, 1406203200, '2015-08-11 04:20:33', 0, 0, NULL),
(509, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 12:00:00 GMT+0000', 'Thu Jul 24 2014 12:30:00 GMT+0000', 1406203200, 1406205000, '2015-08-11 04:20:33', 0, 0, NULL),
(510, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 12:30:00 GMT+0000', 'Thu Jul 24 2014 13:00:00 GMT+0000', 1406205000, 1406206800, '2015-08-11 04:20:33', 0, 0, NULL),
(511, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 13:00:00 GMT+0000', 'Thu Jul 24 2014 13:30:00 GMT+0000', 1406206800, 1406208600, '2015-08-11 04:20:33', 0, 0, NULL),
(512, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 13:30:00 GMT+0000', 'Thu Jul 24 2014 14:00:00 GMT+0000', 1406208600, 1406210400, '2015-08-11 04:20:33', 0, 0, NULL),
(513, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Thu Jul 24 2014 09:00:00 GMT+0000', 'Thu Jul 24 2014 09:30:00 GMT+0000', 1406192400, 1406194200, '2015-08-11 04:20:33', 0, 0, NULL),
(514, '', 2, 'Thang Nguyen1', 47, 'Anh', 'Booked', '169', 'Clinic Location 1', NULL, 'Fri Jul 25 2014 10:30:00 GMT+0000', 'Fri Jul 25 2014 11:00:00 GMT+0000', 1406284200, 1406286000, '2015-08-11 04:20:33', 0, 1, 'Anh(M:(016) 7673-5881:1993) Visit Type: Short Visit Reason:'),
(515, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 25 2014 11:00:00 GMT+0000', 'Fri Jul 25 2014 11:30:00 GMT+0000', 1406286000, 1406287800, '2015-08-11 04:20:33', 0, 1, ''),
(516, '', 2, 'Thang Nguyen1', 47, 'Anh', 'Booked', '169', 'Clinic Location 1', NULL, 'Fri Jul 25 2014 11:30:00 GMT+0000', 'Fri Jul 25 2014 12:00:00 GMT+0000', 1406287800, 1406289600, '2015-08-11 04:20:33', 0, 2, 'Anh(M:(016) 7673-5881:1993) Visit Type: Long Visit Reason:'),
(517, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 25 2014 12:00:00 GMT+0000', 'Fri Jul 25 2014 12:30:00 GMT+0000', 1406289600, 1406291400, '2015-08-11 04:20:33', 0, 0, NULL),
(518, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 25 2014 12:30:00 GMT+0000', 'Fri Jul 25 2014 13:00:00 GMT+0000', 1406291400, 1406293200, '2015-08-11 04:20:33', 0, 0, NULL),
(519, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 25 2014 13:00:00 GMT+0000', 'Fri Jul 25 2014 13:30:00 GMT+0000', 1406293200, 1406295000, '2015-08-11 04:20:33', 0, 0, NULL),
(520, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 25 2014 13:30:00 GMT+0000', 'Fri Jul 25 2014 14:00:00 GMT+0000', 1406295000, 1406296800, '2015-08-11 04:20:33', 0, 0, NULL),
(521, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 25 2014 14:00:00 GMT+0000', 'Fri Jul 25 2014 14:30:00 GMT+0000', 1406296800, 1406298600, '2015-08-11 04:20:33', 0, 0, NULL),
(522, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 25 2014 10:00:00 GMT+0000', 'Fri Jul 25 2014 10:30:00 GMT+0000', 1406282400, 1406284200, '2015-08-11 04:20:33', 0, 2, ''),
(523, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 09:30:00 GMT+0000', 'Fri Jul 18 2014 10:00:00 GMT+0000', 1405675800, 1405677600, '2015-08-11 04:20:33', 0, 0, NULL),
(524, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 10:00:00 GMT+0000', 'Fri Jul 18 2014 10:30:00 GMT+0000', 1405677600, 1405679400, '2015-08-11 04:20:33', 0, 0, NULL),
(525, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 10:30:00 GMT+0000', 'Fri Jul 18 2014 11:00:00 GMT+0000', 1405679400, 1405681200, '2015-08-11 04:20:33', 0, 0, NULL),
(526, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 11:00:00 GMT+0000', 'Fri Jul 18 2014 11:30:00 GMT+0000', 1405681200, 1405683000, '2015-08-11 04:20:33', 0, 0, NULL),
(527, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 11:30:00 GMT+0000', 'Fri Jul 18 2014 12:00:00 GMT+0000', 1405683000, 1405684800, '2015-08-11 04:20:33', 0, 0, NULL),
(528, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 12:00:00 GMT+0000', 'Fri Jul 18 2014 12:30:00 GMT+0000', 1405684800, 1405686600, '2015-08-11 04:20:33', 0, 0, NULL),
(529, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 12:30:00 GMT+0000', 'Fri Jul 18 2014 13:00:00 GMT+0000', 1405686600, 1405688400, '2015-08-11 04:20:33', 0, 0, NULL),
(530, '', 2, 'Thang Nguyen1', 3, 'Manh Thang Nguyen', 'Booked', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 09:00:00 GMT+0000', 'Fri Jul 18 2014 09:30:00 GMT+0000', 1405674000, 1405675800, '2015-08-11 04:20:33', 0, 4, 'Manh Thang Nguyen(M:99999:1905) Visit Type: Travel Vaccin Reason:'),
(531, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 14:00:00 GMT+0000', 'Fri Jul 18 2014 14:30:00 GMT+0000', 1405692000, 1405693800, '2015-08-11 04:20:33', 0, 0, NULL),
(532, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 14:30:00 GMT+0000', 'Fri Jul 18 2014 15:00:00 GMT+0000', 1405693800, 1405695600, '2015-08-11 04:20:33', 0, 0, NULL),
(533, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 15:00:00 GMT+0000', 'Fri Jul 18 2014 15:30:00 GMT+0000', 1405695600, 1405697400, '2015-08-11 04:20:33', 0, 0, NULL),
(534, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 15:30:00 GMT+0000', 'Fri Jul 18 2014 16:00:00 GMT+0000', 1405697400, 1405699200, '2015-08-11 04:20:33', 0, 0, NULL),
(535, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 16:00:00 GMT+0000', 'Fri Jul 18 2014 16:30:00 GMT+0000', 1405699200, 1405701000, '2015-08-11 04:20:33', 0, 0, NULL),
(536, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Fri Jul 18 2014 13:30:00 GMT+0000', 'Fri Jul 18 2014 14:00:00 GMT+0000', 1405690200, 1405692000, '2015-08-11 04:20:33', 0, 0, NULL),
(537, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 09:30:00 GMT+0000', 'Tue Jul 15 2014 10:00:00 GMT+0000', 1405416600, 1405418400, '2015-08-11 04:20:33', 0, 0, NULL),
(538, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 10:00:00 GMT+0000', 'Tue Jul 15 2014 10:30:00 GMT+0000', 1405418400, 1405420200, '2015-08-11 04:20:33', 0, 0, NULL),
(539, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 10:30:00 GMT+0000', 'Tue Jul 15 2014 11:00:00 GMT+0000', 1405420200, 1405422000, '2015-08-11 04:20:33', 0, 0, NULL),
(540, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 11:00:00 GMT+0000', 'Tue Jul 15 2014 11:30:00 GMT+0000', 1405422000, 1405423800, '2015-08-11 04:20:33', 0, 0, NULL),
(541, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 11:30:00 GMT+0000', 'Tue Jul 15 2014 12:00:00 GMT+0000', 1405423800, 1405425600, '2015-08-11 04:20:33', 0, 0, NULL),
(542, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 12:00:00 GMT+0000', 'Tue Jul 15 2014 12:30:00 GMT+0000', 1405425600, 1405427400, '2015-08-11 04:20:33', 0, 0, NULL),
(543, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 12:30:00 GMT+0000', 'Tue Jul 15 2014 13:00:00 GMT+0000', 1405427400, 1405429200, '2015-08-11 04:20:33', 0, 0, NULL),
(544, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 13:00:00 GMT+0000', 'Tue Jul 15 2014 13:30:00 GMT+0000', 1405429200, 1405431000, '2015-08-11 04:20:33', 0, 0, NULL),
(545, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 13:30:00 GMT+0000', 'Tue Jul 15 2014 14:00:00 GMT+0000', 1405431000, 1405432800, '2015-08-11 04:20:33', 0, 0, NULL),
(546, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 14:00:00 GMT+0000', 'Tue Jul 15 2014 14:30:00 GMT+0000', 1405432800, 1405434600, '2015-08-11 04:20:33', 0, 0, NULL),
(547, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 14:30:00 GMT+0000', 'Tue Jul 15 2014 15:00:00 GMT+0000', 1405434600, 1405436400, '2015-08-11 04:20:33', 0, 0, NULL),
(548, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Tue Jul 15 2014 09:00:00 GMT+0000', 'Tue Jul 15 2014 09:30:00 GMT+0000', 1405414800, 1405416600, '2015-08-11 04:20:33', 0, 0, NULL),
(549, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 09:30:00 GMT+0000', 'Sat Jul 19 2014 10:00:00 GMT+0000', 1405762200, 1405764000, '2015-08-11 04:20:33', 0, 0, NULL),
(550, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 10:00:00 GMT+0000', 'Sat Jul 19 2014 10:30:00 GMT+0000', 1405764000, 1405765800, '2015-08-11 04:20:33', 0, 0, NULL),
(551, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 10:30:00 GMT+0000', 'Sat Jul 19 2014 11:00:00 GMT+0000', 1405765800, 1405767600, '2015-08-11 04:20:33', 0, 0, NULL),
(552, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 11:00:00 GMT+0000', 'Sat Jul 19 2014 11:30:00 GMT+0000', 1405767600, 1405769400, '2015-08-11 04:20:33', 0, 0, NULL),
(553, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 11:30:00 GMT+0000', 'Sat Jul 19 2014 12:00:00 GMT+0000', 1405769400, 1405771200, '2015-08-11 04:20:33', 0, 0, NULL),
(554, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Sat Jul 19 2014 09:00:00 GMT+0000', 'Sat Jul 19 2014 09:30:00 GMT+0000', 1405760400, 1405762200, '2015-08-11 04:20:33', 0, 0, NULL),
(555, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 10:00:00 GMT+0000', 'Wed Jul 16 2014 10:30:00 GMT+0000', 1405504800, 1405506600, '2015-08-11 04:20:33', 0, 0, NULL),
(556, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 10:30:00 GMT+0000', 'Wed Jul 16 2014 11:00:00 GMT+0000', 1405506600, 1405508400, '2015-08-11 04:20:33', 0, 0, NULL),
(557, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 11:00:00 GMT+0000', 'Wed Jul 16 2014 11:30:00 GMT+0000', 1405508400, 1405510200, '2015-08-11 04:20:33', 0, 0, NULL),
(558, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 11:30:00 GMT+0000', 'Wed Jul 16 2014 12:00:00 GMT+0000', 1405510200, 1405512000, '2015-08-11 04:20:33', 0, 0, NULL),
(559, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 12:00:00 GMT+0000', 'Wed Jul 16 2014 12:30:00 GMT+0000', 1405512000, 1405513800, '2015-08-11 04:20:33', 0, 0, NULL),
(560, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 12:30:00 GMT+0000', 'Wed Jul 16 2014 13:00:00 GMT+0000', 1405513800, 1405515600, '2015-08-11 04:20:33', 0, 0, NULL),
(561, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 13:00:00 GMT+0000', 'Wed Jul 16 2014 13:30:00 GMT+0000', 1405515600, 1405517400, '2015-08-11 04:20:33', 0, 0, NULL),
(562, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 13:30:00 GMT+0000', 'Wed Jul 16 2014 14:00:00 GMT+0000', 1405517400, 1405519200, '2015-08-11 04:20:33', 0, 0, NULL),
(563, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Wed Jul 16 2014 09:30:00 GMT+0000', 'Wed Jul 16 2014 10:00:00 GMT+0000', 1405503000, 1405504800, '2015-08-11 04:20:33', 0, 0, NULL),
(564, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 11:30:00 GMT+0000', 'Mon Jul 14 2014 12:00:00 GMT+0000', 1405337400, 1405339200, '2015-08-11 04:20:33', 0, 0, NULL),
(565, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 12:00:00 GMT+0000', 'Mon Jul 14 2014 12:30:00 GMT+0000', 1405339200, 1405341000, '2015-08-11 04:20:33', 0, 0, NULL),
(566, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 12:30:00 GMT+0000', 'Mon Jul 14 2014 13:00:00 GMT+0000', 1405341000, 1405342800, '2015-08-11 04:20:33', 0, 0, NULL),
(567, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 13:00:00 GMT+0000', 'Mon Jul 14 2014 13:30:00 GMT+0000', 1405342800, 1405344600, '2015-08-11 04:20:33', 0, 0, NULL),
(568, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 13:30:00 GMT+0000', 'Mon Jul 14 2014 14:00:00 GMT+0000', 1405344600, 1405346400, '2015-08-11 04:20:33', 0, 0, NULL),
(569, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 11:00:00 GMT+0000', 'Mon Jul 14 2014 11:30:00 GMT+0000', 1405335600, 1405337400, '2015-08-11 04:20:33', 0, 0, NULL),
(570, '', 2, 'Thang Nguyen1', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 14:30:00 GMT+0000', 'Mon Jul 14 2014 15:00:00 GMT+0000', 1405348200, 1405350000, '2015-08-11 04:20:33', 0, 0, NULL),
(571, '', 2, 'Tu Pham Thanh', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 10:00:00 GMT+0000', 'Mon Jul 14 2014 10:30:00 GMT+0000', 1405332000, 1405333800, '2015-08-11 04:20:33', 0, 0, NULL),
(572, '', 2, 'Tu Pham Thanh', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 10:30:00 GMT+0000', 'Mon Jul 14 2014 11:00:00 GMT+0000', 1405333800, 1405335600, '2015-08-11 04:20:33', 0, 0, NULL),
(573, '', 2, 'Tu Pham Thanh', 0, '', 'Available', '169', 'Clinic Location 1', NULL, 'Mon Jul 14 2014 11:00:00 GMT+0000', 'Mon Jul 14 2014 11:30:00 GMT+0000', 1405335600, 1405337400, '2015-08-11 04:20:33', 0, 0, NULL),
(574, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 12:00:00 GMT+0000', 'Sat Jul 19 2014 12:30:00 GMT+0000', 1405771200, 1405773000, '2015-08-11 04:20:33', 0, 1, ''),
(575, '', 2, 'lan', 25, 'Dao Thanh Tuyen', 'Booked', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 12:30:00 GMT+0000', 'Sat Jul 19 2014 13:00:00 GMT+0000', 1405773000, 1405774800, '2015-08-11 04:20:33', 0, 1, 'Dao Thanh Tuyen(M:84911233452:1988) Visit Type: Short Visit Reason:'),
(576, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 13:00:00 GMT+0000', 'Sat Jul 19 2014 13:30:00 GMT+0000', 1405774800, 1405776600, '2015-08-11 04:20:33', 0, 1, ''),
(579, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 14:30:00 GMT+0000', 'Sat Jul 19 2014 15:00:00 GMT+0000', 1405780200, 1405782000, '2015-08-11 04:20:33', 0, 0, NULL),
(580, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 15:00:00 GMT+0000', 'Sat Jul 19 2014 15:30:00 GMT+0000', 1405782000, 1405783800, '2015-08-11 04:20:33', 0, 2, ''),
(581, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 15:30:00 GMT+0000', 'Sat Jul 19 2014 16:00:00 GMT+0000', 1405783800, 1405785600, '2015-08-11 04:20:33', 0, 0, NULL),
(582, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 14:00:00 GMT+0000', 'Sat Jul 19 2014 14:30:00 GMT+0000', 1405778400, 1405780200, '2015-08-11 04:20:33', 0, 1, ''),
(583, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 16:30:00 GMT+0000', 'Sat Jul 19 2014 17:00:00 GMT+0000', 1405787400, 1405789200, '2015-08-11 04:20:33', 0, 0, NULL),
(584, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 17:00:00 GMT+0000', 'Sat Jul 19 2014 17:30:00 GMT+0000', 1405789200, 1405791000, '2015-08-11 04:20:33', 0, 0, NULL),
(585, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 16:00:00 GMT+0000', 'Sat Jul 19 2014 16:30:00 GMT+0000', 1405785600, 1405787400, '2015-08-11 04:20:33', 0, 0, NULL),
(586, '', 2, 'lan', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Sat Jul 19 2014 17:30:00 GMT+0000', 'Sat Jul 19 2014 18:00:00 GMT+0000', 1405791000, 1405792800, '2015-08-11 04:20:33', 0, 0, NULL),
(587, '', 2, 'seeyunn', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Tue Jul 22 2014 08:30:00 GMT+0000', 'Tue Jul 22 2014 09:00:00 GMT+0000', 1406017800, 1406019600, '2015-08-11 04:20:33', 0, 0, NULL),
(588, '', 2, 'seeyunn', 25, 'Dao Thanh Tuyen', 'Booked', '174', 'Joonkoon Palace', NULL, 'Tue Jul 22 2014 09:00:00 GMT+0000', 'Tue Jul 22 2014 09:30:00 GMT+0000', 1406019600, 1406021400, '2015-08-11 04:20:33', 0, 2, 'Dao Thanh Tuyen(M:84911233452:1988) Visit Type: Long Visit Reason:'),
(589, '', 2, 'seeyunn', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Tue Jul 22 2014 09:30:00 GMT+0000', 'Tue Jul 22 2014 10:00:00 GMT+0000', 1406021400, 1406023200, '2015-08-11 04:20:33', 0, 0, NULL),
(590, '', 2, 'seeyunn', 0, '', 'Available', '174', 'Joonkoon Palace', NULL, 'Tue Jul 22 2014 08:00:00 GMT+0000', 'Tue Jul 22 2014 08:30:00 GMT+0000', 1406016000, 1406017800, '2015-08-11 04:20:33', 0, 0, NULL),
(591, '', 2, 'seeyunn', 47, 'Anh', 'Booked', '174', 'Joonkoon Palace', NULL, 'Mon Jul 21 2014 12:00:00 GMT+0000', 'Mon Jul 21 2014 12:30:00 GMT+0000', 1405944000, 1405945800, '2015-08-11 04:20:33', 0, 2, 'Anh(M:(016) 7673-5881:1993) Visit Type: Long Visit Reason:');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_facebook_campaign`
--

CREATE TABLE IF NOT EXISTS `tbl_facebook_campaign` (
`id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` varchar(500) NOT NULL,
  `publish` int(11) NOT NULL DEFAULT '0',
  `expired` varchar(10) NOT NULL,
  `reg_date` varchar(10) NOT NULL,
  `reg_time` varchar(5) NOT NULL,
  `timestamp` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `post_ids` varchar(510) NOT NULL,
  `status` int(2) NOT NULL DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_facebook_campaign`
--

INSERT INTO `tbl_facebook_campaign` (`id`, `name`, `description`, `publish`, `expired`, `reg_date`, `reg_time`, `timestamp`, `user_id`, `user_name`, `post_ids`, `status`) VALUES
(4, 'Campaign 1', 'Campaign 1', 1, '', '2015/09/21', '22:52', 1442850120, 2, 'Pham Thanh Tu', '1', 2);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_facebook_groups`
--

CREATE TABLE IF NOT EXISTS `tbl_facebook_groups` (
`id` int(10) NOT NULL,
  `description` varchar(500) NOT NULL,
  `user_id` int(10) NOT NULL,
  `publish` tinyint(1) NOT NULL DEFAULT '0',
  `user_name` varchar(255) NOT NULL,
  `access_token` text NOT NULL,
  `token_expired` tinyint(1) NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `created` varchar(10) NOT NULL,
  `fb_id` bigint(20) NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_facebook_groups`
--

INSERT INTO `tbl_facebook_groups` (`id`, `description`, `user_id`, `publish`, `user_name`, `access_token`, `token_expired`, `name`, `created`, `fb_id`) VALUES
(1, 'My Group Test', 2, 1, 'Pham Thanh Tu', 'CAAKYGWRCAu8BAFZAKHeOKkKE4jnJh3UAlk3VepOzwf0I4atwROjHjYMZBoJwjolnruqyRABXiYAfUZBjygPa6EP5obTgOFr9BK1hjwC9ZAmFIwvhSna5rJAanpk5BbA608V9dGBISaiRPeL3yTPHanauF4Yao95bWLdBrEYzkBZAicKicZCCCV3lUDKf8bd8dHmQ3kFuv2tAZDZD', 0, 'Group Test', '', 700801583356379),
(2, 'Group Test 1', 2, 1, 'Pham Thanh Tu', 'CAAKYGWRCAu8BAHzdjiwQh7226EeaYyFCNivSiYbJ95vZCbmHAPB5WfZCArfdVh6LwPhIm52KZAGh4tKVbIFQkhmVsA0ZCNZC3jb3SalMbUisOCBRukjZChrnBS4PaUOQ1PMSANjlZBzZBtO3IhXCcKZCZB40BNIAW7E1cJ4lmhUZCXQt2ipmLFsdZAlgAu1VGMjy4s21UWvCMeYzjAZDZD', 1, 'Group Test 1', '', 2147483647);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_facebook_group_cat`
--

CREATE TABLE IF NOT EXISTS `tbl_facebook_group_cat` (
`id` int(11) NOT NULL,
  `name` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `publish` tinyint(1) NOT NULL DEFAULT '1',
  `order` int(11) NOT NULL DEFAULT '0',
  `main_img` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `group_ids` varchar(510) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(200) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `tbl_facebook_group_cat`
--

INSERT INTO `tbl_facebook_group_cat` (`id`, `name`, `description`, `publish`, `order`, `main_img`, `group_ids`, `user_id`, `user_name`) VALUES
(1, 'Group Test Collection', 'Group Test Collection', 1, 0, 'media/images/fbtool/facebookgroup_cat/55fe8619b4e32.png', '1', 2, 'Pham Thanh Tu');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_facebook_posts`
--

CREATE TABLE IF NOT EXISTS `tbl_facebook_posts` (
`id` int(10) NOT NULL,
  `user_id` int(10) NOT NULL,
  `user_name` varchar(244) NOT NULL,
  `type` smallint(5) NOT NULL,
  `online` tinyint(1) NOT NULL DEFAULT '0',
  `message` text NOT NULL,
  `link` text NOT NULL,
  `picture` text NOT NULL,
  `name` varchar(200) NOT NULL,
  `caption` text NOT NULL,
  `description` text NOT NULL,
  `publish` tinyint(1) NOT NULL DEFAULT '0',
  `group_cat_ids` varchar(510) NOT NULL,
  `title` varchar(510) NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_facebook_posts`
--

INSERT INTO `tbl_facebook_posts` (`id`, `user_id`, `user_name`, `type`, `online`, `message`, `link`, `picture`, `name`, `caption`, `description`, `publish`, `group_cat_ids`, `title`) VALUES
(1, 2, 'Pham Thanh Tu', 1, 0, 'So sánh sức mạnh của bạn với những nhà vô địch vật tay [r]', 'http://vattay.vn/2015/09/16/compare-your-strength-to-arm-wrestling-champions/', 'http://vattay.vn/wp-content/uploads/2015/09/v4-750x330.jpg', 'Just a test', '', '', 1, '1', '');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE IF NOT EXISTS `tbl_users` (
`id` int(10) unsigned NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `password` varchar(32) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `block` int(11) DEFAULT '0',
  `raw_password` varchar(50) DEFAULT '0',
  `theme` varchar(50) DEFAULT 'gray',
  `avatar` varchar(255) DEFAULT NULL,
  `gmt_zone` varchar(255) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`id`, `fullname`, `password`, `email`, `phone`, `block`, `raw_password`, `theme`, `avatar`, `gmt_zone`) VALUES
(2, 'Pham Thanh Tu', 'e10adc3949ba59abbe56e057f20f883e', 'tubackkhoa@gmail.com', '99999', 0, 'e10adc3949ba59abbe56e057f20f883e', 'gray', 'media/images/medical/customer/53a94b82487ab.jpg', 'Asia/Bangkok'),
(3, 'Manh Thang Nguyen', 'e10adc3949ba59abbe56e057f20f883e', 'nmthangbk@gmail.com', '99999', 0, '123456', '0', 'media/images/medical/customer/53b18328c1281.jpg', 'Asia/Bangkok'),
(23, 'Tran Ngoc Anh', 'e10adc3949ba59abbe56e057f20f883e', 'dragon8814@gmail.com', '99999', 0, '123456', '0', 'media/images/medical/customer/53a94b82487ab.jpg', 'Asia/Bangkok'),
(24, 'Vuong Van Truong', 'e10adc3949ba59abbe56e057f20f883e', 'vuongvantruong1987@gmail.com', '99999', 0, '123456', '0', 'media/images/medical/customer/53b18328c1281.jpg', 'Asia/Bangkok'),
(25, 'Dao Thanh Tuyen', 'e10adc3949ba59abbe56e057f20f883e', 'tuyen.dao88@gmail.com', '99999', 0, '123456', '0', 'media/images/medical/customer/53a94b82487ab.jpg', 'Asia/Bangkok'),
(26, 'Doan Bac c', '14e1b600b1fd579f47433b88e8d85291', 'mrbacdoanc@gmail.com', '99999', 0, 'e10adc3949ba59abbe56e057f20f883e', 'gray', 'media/images/medical/customer/53b18328c1281.jpg', 'Asia/Bangkok'),
(27, 'doan bac', 'e10adc3949ba59abbe56e057f20f883e', 'bac@abc.com', '99999', 0, '123456', 'gray', 'media/images/medical/customer/53a94b82487ab.jpg', 'Asia/Bangkok'),
(28, 'Thang Nguyen M', 'e10adc3949ba59abbe56e057f20f883e', 'nmtdhbk@yahoo.com', '99999', 0, '12345678', 'gray', 'media/images/medical/customer/53b18328c1281.jpg', 'Asia/Bangkok'),
(29, 'Thang Nguyen M', 'e10adc3949ba59abbe56e057f20f883e', 'nmtdhbk1@yahoo.com', '99999', 0, '12345678', 'gray', 'media/images/medical/customer/53a94b82487ab.jpg', 'Asia/Bangkok'),
(30, 'Thang Nguyen M', 'e10adc3949ba59abbe56e057f20f883e', 'nmtdhbk2@yahoo.com', '99999', 0, '12345678', 'gray', 'media/images/medical/customer/53b18328c1281.jpg', 'Asia/Bangkok'),
(31, 'Thang Nguyen M', 'e10adc3949ba59abbe56e057f20f883e', 'nmtdhbk42@yahoo.com', '99999', 0, '12345678', 'gray', 'media/images/medical/customer/53a94b82487ab.jpg', 'Asia/Bangkok'),
(32, 'bacdoancustom', 'e10adc3949ba59abbe56e057f20f883e', 'mrbacdoancustom@gmail.com', '99999', 0, '123456', 'gray', 'media/images/medical/customer/53b18328c1281.jpg', 'Asia/Bangkok');

-- --------------------------------------------------------

--
-- Table structure for table `translate`
--

CREATE TABLE IF NOT EXISTS `translate` (
  `tid` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `lang` char(2) COLLATE utf8_unicode_ci NOT NULL,
  `str` varchar(4000) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `translate`
--

INSERT INTO `translate` (`tid`, `lang`, `str`) VALUES
('article_content_661', 'vi', '<p><img alt="Candy Crush Saga v chin lc marketing  thu 1 triu USDngy" src="http://static.ngankeo.vn/full/2013/11/23/6-chien-luoc-phat-trien-san-pham-cua-candy-crush-saga-giup-thu-ve-1-trieu-usd-ngay-1c1a578b127b5e273e490db0aad3a215c4aba2bc.jpg" title="Image: http://static.ngankeo.vn/full/2013/11/23/6-chien-luoc-phat-trien-san-pham-cua-candy-crush-saga-giup-thu-ve-1-trieu-usd-ngay-1c1a578b127b5e273e490db0aad3a215c4aba2bc.jpg" /> Tờ Forbes (Mỹ) cho rằng sự th&agrave;nh c&ocirc;ng của Candy Crush Saga (gọi tắt l&agrave; Candy) ch&iacute;nh l&agrave; yếu tố &ldquo;g&acirc;y nghiện&rdquo;. Game đơn giản n&agrave;y lại đang trở th&agrave;nh &ldquo;mỏ v&agrave;ng&rdquo; khi trung b&igrave;nh mỗi th&aacute;ng, c&oacute; khoảng 45,2 triệu th&agrave;nh vi&ecirc;n Facebook tham gia chơi, theo thống k&ecirc; của AppData. Ngay tr&ecirc;n App Store, Candy cũng từng giữ vị tr&iacute; đầu ti&ecirc;n t&iacute;nh theo số lượt tải về. Ở ph&acirc;n v&ugrave;ng Việt Nam tr&ecirc;n Google Play, Candy cũng gi&agrave;nh thứ hạng cao khi hạ c&aacute;nh ở vị tr&iacute; thứ 8 (c&aacute;c vị tr&iacute; dẫn đầu đều l&agrave; c&aacute;c ứng dụng mạng x&atilde; hội). <img alt="Candy Crush Saga v chin lc marketing  thu 1 triu USDngy" src="http://static.ngankeo.vn/full/2013/11/23/6-chien-luoc-phat-trien-san-pham-cua-candy-crush-saga-giup-thu-ve-1-trieu-usd-ngay-5c4dd708f6e56526be0c1995de893efb76e15d3c.jpg" title="Image: http://static.ngankeo.vn/full/2013/11/23/6-chien-luoc-phat-trien-san-pham-cua-candy-crush-saga-giup-thu-ve-1-trieu-usd-ngay-5c4dd708f6e56526be0c1995de893efb76e15d3c.jpg" /> Candy Crush Saga nhiều lần đứng top đầu b&igrave;nh chọn tr&ecirc;n mạng x&atilde; hội <img alt="Candy Crush Saga v chin lc marketing  thu 1 triu USDngy" src="http://static.ngankeo.vn/full/2013/11/23/6-chien-luoc-phat-trien-san-pham-cua-candy-crush-saga-giup-thu-ve-1-trieu-usd-ngay-498d91f71812fb9a254bd9d47641906ea1343d80.jpg" title="Image: http://static.ngankeo.vn/full/2013/11/23/6-chien-luoc-phat-trien-san-pham-cua-candy-crush-saga-giup-thu-ve-1-trieu-usd-ngay-498d91f71812fb9a254bd9d47641906ea1343d80.jpg" /> V&agrave; cũng đứng đầu tr&ecirc;n App Store Để c&oacute; được th&agrave;nh c&ocirc;ng đ&oacute;, Forbes đ&atilde; liệt k&ecirc; 6 điểm s&aacute;ng trong chiến lược marketing của King gi&uacute;p Candy tiếp cận dễ d&agrave;ng với đối tượng kh&aacute;ch h&agrave;ng của m&igrave;nh.</p>\r\n\r\n<h3>Hạn chế người chơi: từ nghịch l&yacute; tới hợp l&yacute;</h3>\r\n\r\n<p>Nhiều tr&ograve; chơi điện tử kh&aacute;c cho ph&eacute;p c&aacute;c game thủ c&oacute; thể chơi thường xuy&ecirc;n v&agrave; trong thời gian bao l&acirc;u t&ugrave;y th&iacute;ch. Việc &ldquo;hạn chế&rdquo; n&agrave;y c&oacute; thể khiến người chơi kh&oacute; chịu. Tuy nhi&ecirc;n, King vẫn trung th&agrave;nh với chiến lược chỉ cho ph&eacute;p người chơi c&oacute; 5 mạng, sau 30 ph&uacute;t th&igrave; mới được cấp mạng mới. Điều n&agrave;y v&ocirc; h&igrave;nh trung trở th&agrave;nh một trong những điểm &ldquo;g&acirc;y nghiện&rdquo; của Candy. Bởi kh&ocirc;ng chỉ khiến người chơi kh&oacute; chịu v&igrave; &ldquo;đang vui m&agrave; đứt d&acirc;y đ&agrave;n&rdquo;, chiến thuật đ&oacute; c&ograve;n gi&uacute;p ngăn ngừa sự say m&ecirc; chơi qu&aacute; độ, chưa kể, thời gian chờ đợi &ldquo;th&ecirc;m mạng&rdquo; cũng khiến người chơi th&ecirc;m hứng th&uacute; với những &ldquo;vi&ecirc;n kẹo ngọt&rdquo; n&agrave;y. Nh&agrave; t&acirc;m l&yacute; học Robert Cialdini thuộc khoa T&acirc;m l&yacute; v&agrave; Marketing, trường Đại học Arizona (Mỹ) cho rằng: &ldquo;Sự khan hiếm l&agrave; một trong 6 điều g&acirc;y hứng th&uacute; ở con người, ch&uacute;ng ta sẽ cảm thấy th&iacute;ch những thứ g&igrave; chỉ được cung cấp c&oacute; giới hạn&rdquo;. V&agrave; Candy đ&atilde; tận dụng triệt để điều đ&oacute;, Forbes b&igrave;nh luận.</p>\r\n\r\n<h3>Yếu tố &ldquo;miễn ph&iacute;&rdquo; &ndash; mồi c&acirc;u hiệu quả</h3>\r\n\r\n<p>Gi&aacute;o sư ng&agrave;nh t&acirc;m l&yacute; học Dan Ariely v&agrave; c&aacute;c đồng nghiệp tại trư'),
('article_content_662', 'vi', '<p><img alt="" src="http://seosweb.net/seosweb-content/uploads/2013/08/tim-hieu-ve-content-marketing-la-gi.gif" /></p>\r\n\r\n<h2>Viral Marketing c&oacute; thể l&agrave;m g&igrave;?</h2>\r\n\r\n<h3>Tạo ra sự đột ph&aacute;</h3>\r\n\r\n<p>Với 5,3 triệu tỉ quảng c&aacute;o được c&ocirc;ng khai mỗi năm, 400 triệu d&ograve;ng tweet, 4,75 tỉ nội dung Facebook được cập nhật mỗi ng&agrave;y, 144.000 giờ được d&agrave;nh cho Youtube, đăng một v&agrave;i nội dung nửa vời tr&ecirc;n blog hoặc tr&ecirc;n trang mạng c&aacute; nh&acirc;n sẽ kh&ocirc;ng dẫn bạn đi xa. Bạn cần tạo ra một thứ g&igrave; đ&oacute; thực sự kh&aacute;c biệt.</p>\r\n\r\n<h3>Tăng độ phủ thương hiệu v&agrave; tận dụng truyền th&ocirc;ng miễn ph&iacute;</h3>\r\n\r\n<p>Một chiến dịch viral th&agrave;nh c&ocirc;ng thường mang lại khoảng 1 triệu điểm ấn tượng với rất nhiều lời t&aacute;n dương miễn ph&iacute; được c&aacute;c phương tiện truyền th&ocirc;ng nhu TV, radio hay b&aacute;o in đăng tải. V&iacute; dụ, năm 2012, chiến dịch &ldquo;Kony 2012&rdquo; đ&atilde; thu h&uacute;t được gần 100.000.000 lượt xem v&agrave; được giới thiệu bởi hầu hết c&aacute;c h&atilde;ng th&ocirc;ng tấn lớn. Tr&ecirc;n Google News, chiến dịch c&oacute; hơn 2.000 kết quả.</p>\r\n\r\n<h3>Tăng lượng tương t&aacute;c x&atilde; hội c&oacute; thể tăng sự ủng hộ của c&ocirc;ng ch&uacute;ng cho thương hiệu</h3>\r\n\r\n<p>Khi chiến dịch Dove - Vẻ đẹp đ&iacute;ch thực đạt được độ viral, chỉ trong v&ograve;ng 10 ng&agrave;y, n&oacute; đ&atilde; thu h&uacute;t được 30 triệu lượt xem c&ugrave;ng với đ&oacute; k&ecirc;nh Youtube của Dove cũng c&oacute; th&ecirc;m đến 15.000 đăng k&iacute; trong 2 th&aacute;ng ngắn ngủi, đ&oacute; l&agrave; chưa kể đến số lượng độc giả tăng l&ecirc;n tr&ecirc;n Twitter v&agrave; Facebook.</p>\r\n\r\n<h3>Tăng xếp h&agrave;ng t&igrave;m kiếm tự nhi&ecirc;n (organic search)</h3>\r\n\r\n<p>Trong khảo s&aacute;t của ch&uacute;ng t&ocirc;i, hai chiến dịch viral th&agrave;nh c&ocirc;ng (Dying to be Barbie v&agrave; Before and After Drugs: The Horrors of Mathamphetamine) đ&atilde; c&oacute; được lượng tăng l&ecirc;n ấn tượng trong lưu lượng t&igrave;m kiếm tự nhi&ecirc;n. Nội dung viral đ&oacute;ng một vai tr&ograve; quan trọng trong thuật to&aacute;n xếp hạng của c&ocirc;ng cụ t&igrave;m kiếm Google.</p>\r\n\r\n<h3>Tăng độ tương t&aacute;c với thương hiệu</h3>\r\n\r\n<p>Khi người d&ugrave;ng tương t&aacute;c với thương hiệu th&ocirc;ng qua nội dung họ chủ động chọn, hơn l&agrave; nội dung họ bị định hướng, kh&aacute;ch h&agrave;ng sẽ tương t&aacute;c t&iacute;ch cực hơn.</p>\r\n\r\n<h3>Vậy, c&aacute;ch để tạo ra một chiến dịch viral th&agrave;nh c&ocirc;ng l&agrave; g&igrave;?</h3>\r\n\r\n<p><img alt="" src="http://wp.streetwise.co/wp-content/uploads/2013/02/Viral-Marketing-pic-of-people.jpg" /> B&agrave;i học 1: Tạo ra hệ số viral &gt; 1 Tạo ra sự kh&aacute;c biệt v&agrave; lan tỏa l&agrave; kết quả trực tiếp của việc c&oacute; được hệ số viral lớn hơn 1. Đơn giản hơn, hệ số viral c&oacute; thể được hiểu l&agrave; số lượng người xem mới được tạo ra từ một người xem cũ. Hệ số viral lớn hơn 1 c&oacute; nghĩa l&agrave; nội dung đ&atilde; tạo ra một sự tăng trưởng lan tỏa v&agrave; vẫn đang tăng l&ecirc;n, trong khi đ&oacute;, nếu hệ số viral nhỏ hơn 1, chiến dịch đang tạo ra một hiệu ứng ngược v&agrave; kh&ocirc;ng hiệu quả. Vậy l&agrave;m sao để tạo ra được nội dung m&agrave; mọi người sẵn l&ograve;ng chia sẻ? Bước 1: Viết ti&ecirc;u đề ấn tượng Ti&ecirc;u đề l&agrave; những g&igrave; sẽ thu h&uacute;t những người xem mới. C&agrave;ng nhiều người tiếp cận đến nội dung của bạn, cơ hội nội dung được chia sẻ sẽ c&agrave;ng tăng l&ecirc;n. Nếu bạn kh&ocirc;ng kiếm được lượng click ban đầu khả quan, nội dung đ&atilde; chết từ trong trứng. Bước 2: Sử dụng cảm x&uacute;c mạnh để thu h&uacute;t sự quan t&acirc;m từ ph&iacute;a độc giả Việc tạo ra cảm x&uacute;c mạnh mẽ, hứng khởi nhanh ch&oacute;ng đ&oacute;ng một vai tr&ograve; quan trọng. H&atilde;y sử dụng cảm x&uacute;c mạnh v&agrave; tối giảm yếu tố thương hiệu xuất hiện trong nội d'),
('article_content_663', 'vi', '<p>&nbsp; &nbsp; Con số thống k&ecirc; cho thấy, trong năm 2013 vừa qua, c&oacute; từ 80 &ndash; 90 % game mobile tại thị trường trong nước l&agrave; game ngoại. Đ&aacute;ng lo ngại hơn, việc ph&aacute;t h&agrave;nh trực tiếp game mobile tại Việt Nam qu&aacute; dễ d&agrave;ng khiến nhiều nh&agrave; sản xuất nước ngo&agrave;i c&oacute; thể thu được 100% doanh thu từ game m&agrave; kh&ocirc;ng cần th&ocirc;ng qua bất cứ nh&agrave; ph&acirc;n phối trong nước n&agrave;o. &nbsp; &nbsp;Về mặt chất lượng game mobile, c&oacute; thể khẳng định c&aacute;c nh&agrave; sản xuất trong nước kh&ocirc;ng hề k&eacute;m cạnh so với c&aacute;c nh&agrave; sản xuất nước ngo&agrave;i cả về đồ họa, t&iacute;nh năng lẫn c&aacute;ch chơi. Tuy nhi&ecirc;n, việc định hướng để ph&aacute;t triển game chưa tốt v&agrave; số lượng game c&oacute; chất lượng cao chưa nhiều đ&atilde; dẫn đến t&igrave;nh trạng game mobile Việt bị &ldquo;l&eacute;p vế&rdquo; ngay tại s&acirc;n nh&agrave;. Điều n&agrave;y khiến c&aacute;c nh&agrave; ph&acirc;n phối trong nước d&ugrave; muốn d&ugrave; kh&ocirc;ng vẫn phải nhập game ngoại về để đảm bảo doanh thu. <img alt="" src="http://genk2.vcmedia.vn/gzsOnkcdQ4Dg5q1e4Ckccccccccc/Image/2014/03/QAnh1/Avatar-31949.png" /> &nbsp; Chiến binh CS - Tựa game Việt được đ&aacute;nh gi&aacute; cao về đồ họa v&agrave; gameplay<br />\r\nVậy đ&acirc;u l&agrave; hướng đi cho c&aacute;c startup game mobile Việt trong thời gian sắp tới ? Trong một cuộc trao đổi tại sự kiện Vietnam Mobile Day vừa qua, một số diễn giả như &ocirc;ng Trần Vinh Quang &ndash; COO Appota, &ocirc;ng Nguyễn Kh&aacute;nh Duy- CEO Tofu Games Studio đ&atilde; đưa ra những &yacute; kiến sau:<br />\r\n- Tiếp tục n&acirc;ng cao năng lực sản xuất: Hiện tại, năng lực của c&aacute;c studio game mobile Việt Nam c&oacute; thể tự tin so s&aacute;nh c&ugrave;ng c&aacute;c studio game kh&aacute;c tr&ecirc;n thế giới, tuy nhi&ecirc;n cần tiếp tục n&acirc;ng cao hơn nữa cả về tr&igrave;nh độ lẫn số lượng. Cụ thể: C&aacute;c đơn vị sản xuất game cần t&iacute;ch cực trao đổi học hỏi kinh nghiệm, tiến đến x&acirc;y dựng kho tư liệu chung trong ng&agrave;nh game mobile v&agrave; kh&ocirc;ng ngừng học hỏi c&aacute;c studio th&agrave;nh c&ocirc;ng tr&ecirc;n thế giới.<br />\r\n- Phối hợp với c&aacute;c đơn vị ph&acirc;n phối ứng dụng tại Việt Nam như Appota, mWork để sản phẩm c&oacute; thể đến được với người d&ugrave;ng cuối. Trong m&ocirc; h&igrave;nh n&agrave;y, c&aacute;c studio game n&ecirc;n giao ho&agrave;n to&agrave;n việc quảng b&aacute; game cho c&aacute;c nh&agrave; ph&acirc;n phối trong nước để tập trung nguồn lực ho&agrave;n thiện chất lượng sản phẩm. Khi đ&oacute;, nh&agrave; ph&acirc;n phối sẽ tư vấn cho studio về xu hướng ph&aacute;t triển, thị hiếu người d&ugrave;ng v&agrave; gi&uacute;p đỡ về kế hoạch kinh doanh khi đưa game ra thị trường<br />\r\n- Mở c&aacute;c kh&oacute;a đ&agrave;o tạo chuy&ecirc;n s&acirc;u về thiết kế game, n&acirc;ng cao chất lượng v&agrave; số lượng nguồn nh&acirc;n lực trong nước<br />\r\n- Cần khuấy động phong tr&agrave;o người Việt chơi game Việt trong cộng đồng. &nbsp; Theo ICT News.</p>'),
('article_description_661', 'vi', 'Like Pandora.vn để được cập nhật tin công nghệ chuyên sâu và nóng hổi!\r\n						\r\n						 \r\n						Tuy không còn quá “hot” như thời kỳ mới phát hành, nhưng trò chơi Candy Crush Saga vẫn đủ sức hút người chơi mới và níu giữ nhiều người từng “phát cuồng” vì những viên kẹo đầy màu sắc. Chìa khóa marketing cho sự thành công đó có thể nhìn thấy rõ qua việc công ty phát triển King.com thu về gần 1 triệu USD/ngày, đang là một bài học đối với cả những ai không làm trong lĩnh vực game online.'),
('article_description_662', 'vi', 'Cách tốt nhất để làm lan tỏa nội dung đó là đánh trúng vào tâm lý người xem, vậy làm sao để thực hiện được điều đó?'),
('article_description_663', 'vi', 'Tại sự kiện Vietnam Mobile Day vừa diễn ra, một chủ để được rất nhiều người quan tâm đó là làm thế nào để game mobile Việt có thể cạnh tranh với các game nước ngoài ngay tại sân nhà của mình'),
('article_title_661', 'vi', '6 chiến lược phát triển sản phẩm của Candy Crush Saga giúp thu về 1 triệu USD/ngày'),
('article_title_662', 'vi', 'Hé lộ loại cảm xúc sẽ tạo nên một chiến dịch marketing viral'),
('article_title_663', 'vi', 'Hướng đi của startup game mobile Việt trước “rừng” game ngoại'),
('menu_name_1', 'cn', 'Home'),
('menu_name_1', 'en', 'Home'),
('menu_name_1', 'jp', 'ホーム'),
('menu_name_1', 'kr', 'Home'),
('menu_name_1', 'vi', 'Tất cả'),
('menu_name_14', 'vi', 'Thuê xe'),
('menu_name_2', 'vi', 'Khách sạn'),
('menu_name_44', 'vi', 'Ăn uống'),
('menu_name_45', 'vi', 'Mua sắm'),
('menu_name_9', 'vi', 'Du lịch'),
('section_title_1', 'vi', 'Thời sự');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_acl`
--
ALTER TABLE `admin_acl`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `route` (`route`);

--
-- Indexes for table `admin_groups`
--
ALTER TABLE `admin_groups`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `config`
--
ALTER TABLE `config`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
 ADD PRIMARY KEY (`id`), ADD KEY `Notification_index` (`type`,`recipient_type`,`recipient_id`);

--
-- Indexes for table `tbl_events`
--
ALTER TABLE `tbl_events`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_facebook_campaign`
--
ALTER TABLE `tbl_facebook_campaign`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_facebook_groups`
--
ALTER TABLE `tbl_facebook_groups`
 ADD PRIMARY KEY (`id`), ADD KEY `id_user` (`user_id`), ADD KEY `user_id` (`publish`), ADD KEY `id_user_2` (`user_id`), ADD KEY `user_id_2` (`publish`);

--
-- Indexes for table `tbl_facebook_group_cat`
--
ALTER TABLE `tbl_facebook_group_cat`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_facebook_posts`
--
ALTER TABLE `tbl_facebook_posts`
 ADD PRIMARY KEY (`id`), ADD KEY `user_id` (`user_id`), ADD KEY `user_id_2` (`user_id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `translate`
--
ALTER TABLE `translate`
 ADD PRIMARY KEY (`tid`,`lang`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_acl`
--
ALTER TABLE `admin_acl`
MODIFY `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `admin_groups`
--
ALTER TABLE `admin_groups`
MODIFY `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
MODIFY `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=23;
--
-- AUTO_INCREMENT for table `config`
--
ALTER TABLE `config`
MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=57;
--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=31;
--
-- AUTO_INCREMENT for table `tbl_events`
--
ALTER TABLE `tbl_events`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=592;
--
-- AUTO_INCREMENT for table `tbl_facebook_campaign`
--
ALTER TABLE `tbl_facebook_campaign`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `tbl_facebook_groups`
--
ALTER TABLE `tbl_facebook_groups`
MODIFY `id` int(10) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `tbl_facebook_group_cat`
--
ALTER TABLE `tbl_facebook_group_cat`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT for table `tbl_facebook_posts`
--
ALTER TABLE `tbl_facebook_posts`
MODIFY `id` int(10) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=33;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

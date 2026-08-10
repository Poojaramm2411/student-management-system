-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: student
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_47bvqemyk6vlm0w7crc3opdd4` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'rpooja12@gmail.com','Pooja','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhuG','ACTIVE'),(7,'ram43@gmail.com','Ram','$2a$10$HXhuAk68ZdIZvo5mqCQMMOlI2QUTEV1J/LQb/4ObCZohQqMXWqnPW','ACTIVE'),(8,'sreeram43@gmail.com','Ram','$2a$10$ZwfDNDKaLhxu/h3vLr.1h.MwKzp0RnYHn3dfHuYk.fFrTnitQNGr.','ACTIVE'),(9,'antigravity@test.com','Antigravity','$2a$10$T8PoESJroFOLSjakln.1l.LCqLs0UD7bSl4ocIv8mPNAdAftXTFGa','ACTIVE');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment`
--

DROP TABLE IF EXISTS `assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assigned_date` varchar(255) DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `description` text,
  `due_date` varchar(255) NOT NULL,
  `max_marks` int NOT NULL,
  `status` enum('DRAFT','PUBLISHED','CLOSED') NOT NULL,
  `submission_type` enum('FILE','TEXT','LINK') NOT NULL,
  `title` varchar(255) NOT NULL,
  `batch_id` bigint NOT NULL,
  `instructor_id` bigint NOT NULL,
  `encrypted_questions` text,
  PRIMARY KEY (`id`),
  KEY `FKbtyynaw7ge1m3i8h1cb78u61k` (`batch_id`),
  KEY `FKij3qxsegmoao71525qm8n795i` (`instructor_id`),
  CONSTRAINT `FKbtyynaw7ge1m3i8h1cb78u61k` FOREIGN KEY (`batch_id`) REFERENCES `batch` (`id`),
  CONSTRAINT `FKij3qxsegmoao71525qm8n795i` FOREIGN KEY (`instructor_id`) REFERENCES `instructor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment`
--

LOCK TABLES `assignment` WRITE;
/*!40000 ALTER TABLE `assignment` DISABLE KEYS */;
INSERT INTO `assignment` VALUES (1,'07/11/2026','','','07/12/2026',9,'PUBLISHED','TEXT','React Assigment',1,6,NULL),(2,'07/12/2026','','','07/13/2026',9,'PUBLISHED','TEXT','Java Assignment',2,1,NULL),(3,'07/20/2026','','','07/21/2026',15,'PUBLISHED','TEXT','Mern Fullstack',5,3,NULL),(4,'07/18/2026','','','07/19/2026',11,'PUBLISHED','TEXT','Python Assignment',3,2,NULL),(5,'07/20/2026','','','07/21/2026',11,'PUBLISHED','TEXT','Mean Fullstack',7,7,NULL);
/*!40000 ALTER TABLE `assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_submission`
--

DROP TABLE IF EXISTS `assignment_submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_submission` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text,
  `feedback` text,
  `file_url` varchar(255) DEFAULT NULL,
  `graded_at` datetime(6) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `marks_obtained` int DEFAULT NULL,
  `status` enum('PENDING','SUBMITTED','LATE','GRADED') NOT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `assignment_id` bigint NOT NULL,
  `graded_by` bigint DEFAULT NULL,
  `student_id` bigint NOT NULL,
  `assigned_set` int DEFAULT NULL,
  `tried_sets` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnx5kjx5uxg2nayxi78y8ikuos` (`assignment_id`,`student_id`),
  KEY `FK2sel4bcb89mvx3hsaci4qs3ju` (`graded_by`),
  KEY `FKb4ifsk7hs0eflfk1sqj4y3mq` (`student_id`),
  CONSTRAINT `FK2sel4bcb89mvx3hsaci4qs3ju` FOREIGN KEY (`graded_by`) REFERENCES `instructor` (`id`),
  CONSTRAINT `FKb4ifsk7hs0eflfk1sqj4y3mq` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
  CONSTRAINT `FKi9tdkyaqlb4j7qm7y2k74jd7o` FOREIGN KEY (`assignment_id`) REFERENCES `assignment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submission`
--

LOCK TABLES `assignment_submission` WRITE;
/*!40000 ALTER TABLE `assignment_submission` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_submission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batch`
--

DROP TABLE IF EXISTS `batch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `batch_name` varchar(255) DEFAULT NULL,
  `end_date` varchar(255) DEFAULT NULL,
  `start_date` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `batch_code` varchar(255) NOT NULL,
  `course_id` bigint NOT NULL,
  `instructor_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_batch_course` (`course_id`),
  KEY `FK9b248hf6wwvt1xiw9vt693pyj` (`instructor_id`),
  CONSTRAINT `FK9b248hf6wwvt1xiw9vt693pyj` FOREIGN KEY (`instructor_id`) REFERENCES `instructor` (`id`),
  CONSTRAINT `fk_batch_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch`
--

LOCK TABLES `batch` WRITE;
/*!40000 ALTER TABLE `batch` DISABLE KEYS */;
INSERT INTO `batch` VALUES (1,'Morning batch','10/08/2026','07/02/2026','ACTIVE','MB001',1,6),(2,'Evening batch','12/08/2026','07/04/2026','ACTIVE','EB002',3,1),(3,'Afternoon batch','10/23/2026','07/06/2026','ACTIVE','AB003',10,2),(4,'Evening batch','10/10/2026','07/05/2026','ACTIVE','EB004',18,8),(5,'Morning batch','12/30/2026','07/05/2026','ACTIVE','MB005',5,3),(6,'Afternoon batch','10/08/2026','07/05/2026','ACTIVE','AB006',20,5),(7,'Morning batch','12/10/2026','07/07/2026','ACTIVE','MB007',7,7),(8,'Evening batch','12/31/2026','07/08/2026','ACTIVE','EB008',13,4);
/*!40000 ALTER TABLE `batch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `course_code` varchar(255) NOT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `fee` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcu6u0c70qtkon4w4j63ixb6fw` (`course_code`),
  UNIQUE KEY `UKn42sh59vu4elmgr3tu4ah784g` (`course_name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,'react development','ACTIVE','CRS001','4',15000),(3,'Java','ACTIVE','CRS003','6',12000),(5,'Mern Fullstack','ACTIVE','CRS005','6',20000),(7,'Mean Fullstack','ACTIVE','CRS007','6',20000),(10,'Python','ACTIVE','CRS010','4',10000),(13,'Mevn Fullstack','ACTIVE','CRS013','6',20000),(18,'C++','ACTIVE','CRS018','4',15000),(19,'Manual Testing','INACTIVE','CRS019','3',10000),(20,'Devops','ACTIVE','CRS020','4',22000);
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_backup`
--

DROP TABLE IF EXISTS `course_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `course_name` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `course_code` varchar(255) NOT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `fee` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_backup`
--

LOCK TABLES `course_backup` WRITE;
/*!40000 ALTER TABLE `course_backup` DISABLE KEYS */;
INSERT INTO `course_backup` VALUES (1,'react development','ACTIVE','CRS001','4',15000),(2,'react development','ACTIVE','CRS002','4',15000),(3,'Java','ACTIVE','CRS003','6',12000),(4,'Java','ACTIVE','CRS004','6',12000),(5,'Mern Fullstack','ACTIVE','CRS005','6',20000),(6,'Mern Fullstack','ACTIVE','CRS006','6',20000),(7,'Mean Fullstack','ACTIVE','CRS007','6',20000),(8,'Mean Fullstack','ACTIVE','CRS008','6',20000),(9,'Mean Fullstack','ACTIVE','CRS009','6',20000),(10,'Python','ACTIVE','CRS010','4',10000),(11,'Python','ACTIVE','CRS011','4',10000),(12,'Python','ACTIVE','CRS012','4',10000),(13,'Mevn','ACTIVE','CRS013','6',20000),(14,'Mern Fullstack','ACTIVE','CRS014','6',20000),(15,'Mevn Fullstack','ACTIVE','CRS015','6',20000),(16,'Python','ACTIVE','CRS016','4',10000),(17,'Python','ACTIVE','CRS017','4',10000),(18,'C++','ACTIVE','CRS018','4',15000),(19,'Manual Testing','INACTIVE','CRS019','3',10000),(20,'Devops','ACTIVE','CRS020','4',22000);
/*!40000 ALTER TABLE `course_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `base_fee` double DEFAULT NULL,
  `batch_name` varchar(255) DEFAULT NULL,
  `course_name` varchar(255) DEFAULT NULL,
  `enrolled_date` date DEFAULT NULL,
  `fee_status` varchar(255) DEFAULT NULL,
  `gst_amount` double DEFAULT NULL,
  `paid_amount` double DEFAULT NULL,
  `payment_mode` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `total_fee` double DEFAULT NULL,
  `batch_id` bigint DEFAULT NULL,
  `course_id` bigint DEFAULT NULL,
  `student_id` bigint DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `card_number` varchar(255) DEFAULT NULL,
  `cheque_number` varchar(255) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeqlwt0wu71m2jesppv7dc75dv` (`batch_id`),
  KEY `FKdt1abrh0t316jumlhprnm74v0` (`student_id`),
  KEY `FKho8mcicp4196ebpltdn9wl6co` (`course_id`),
  CONSTRAINT `FKdt1abrh0t316jumlhprnm74v0` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
  CONSTRAINT `FKeqlwt0wu71m2jesppv7dc75dv` FOREIGN KEY (`batch_id`) REFERENCES `batch` (`id`),
  CONSTRAINT `FKm6ptklbuk36d0q5nb8vpwnj48` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,15000,'Morning batch','react development','2026-07-01','Pending',2700,0,'Cash','Active','suresh',17700,1,1,1,NULL,NULL,NULL,NULL),(2,12000,'Evening batch','Java','2026-07-02','Pending',2160,0,'Cash','Active','suresh',14160,2,3,2,NULL,NULL,NULL,NULL),(3,15000,'Morning batch','react development','2026-07-02','Paid',2700,17700,'Card','Active','kumar',17700,1,1,3,NULL,NULL,NULL,NULL),(4,15000,'Evening batch','C++','2026-07-02','Partial',2700,6000,'Card','Active','kumar',17700,2,18,4,NULL,NULL,NULL,NULL),(5,12000,'Evening batch','Java','2026-07-02','Paid',2160,14160,'Cash','Active','Ravi kumar',14160,2,3,5,NULL,NULL,NULL,NULL),(6,15000,'Morning batch','react development','2026-07-02','Partial',2700,10000,'Cash','Active','ram',17700,1,1,6,NULL,NULL,NULL,NULL),(7,15000,'Morning batch','react development','2026-07-02','Pending',2700,0,'UPI','Active','rajesh',17700,1,1,7,NULL,NULL,NULL,NULL),(8,15000,'Morning batch','react development','2026-07-02','Partial',2700,10000,'Cash','Active','mega',17700,1,1,8,NULL,NULL,NULL,NULL),(9,12000,'Evening batch','Java','2026-07-02','Pending',2160,0,'Card','Active','Prabha',14160,2,3,9,NULL,NULL,NULL,NULL),(10,12000,'Afternoon batch','Java','2026-07-02','Paid',2160,14160,'Cash','Active','sree',14160,3,3,11,NULL,NULL,NULL,NULL),(11,15000,'Morning batch','react development','2026-07-02','Partial',2700,10000,'Card','Active','sivagi',17700,1,1,12,NULL,NULL,NULL,NULL),(12,15000,'Morning batch','react development','2026-07-02','Paid',2700,17700,'Cash','Active','Raghu',17700,1,1,13,NULL,NULL,NULL,NULL),(13,12000,'Evening batch','Java','2026-07-02','Paid',2160,14160,'Cash','Active','shrinidhi',14160,2,3,14,NULL,NULL,NULL,NULL),(14,12000,'Evening batch','Java','2026-07-02','Paid',2160,14160,'Bank Transfer','Active','sathya',14160,2,3,15,NULL,NULL,NULL,NULL),(15,15000,'Morning batch','react development','2026-07-02','Pending',2700,0,'Cash','Active','bagavathiragan',17700,1,1,16,NULL,NULL,NULL,NULL),(16,12000,'Evening batch','Java','2026-07-02','Paid',2160,14160,'Card','Active','barathi',14160,2,3,17,NULL,NULL,NULL,NULL),(17,15000,'Morning batch','react development','2026-07-02','Partial',2700,10000,'Cash','Active','Harikrishnan',17700,1,1,18,NULL,NULL,NULL,NULL),(18,12000,'Evening batch','Java','2026-07-02','Paid',2160,14160,'Cash','Active','Diviya',14160,2,3,19,NULL,NULL,NULL,NULL),(19,22000,'Afternoon batch','Devops','2026-07-02','Partial',3960,5000,'Cash','Active','Bhuvana',25960,6,20,20,NULL,NULL,NULL,NULL),(20,20000,'Morning batch','Mern Fullstack','2026-07-02','Paid',3600,23600,'Card','Active','Indhu',23600,1,5,21,NULL,NULL,NULL,NULL),(24,12000,'Evening batch','Java','2026-07-06','Paid',2160,14160,'Cash','Active','Revathi',14160,2,3,28,'','','',''),(25,10000,'Afternoon batch','Python','2026-07-15','Partial',1800,5000,'Cash','Active','Harikrishnan',11800,3,10,18,'','','',''),(26,20000,'Morning batch','Mern Fullstack','2026-07-15','Partial',3600,5000,'Cash','Active','Srisiva Hari',23600,5,5,29,'','','',''),(27,20000,'Morning batch','Mean Fullstack','2026-07-15','Partial',3600,3999,'Cash','Active','Madhav',23600,7,7,30,'','','',''),(28,20000,'Morning batch','Mern Fullstack','2026-07-15','Partial',3600,3000,'Cash','Active','Kowshika',23600,5,5,31,'','','',''),(29,20000,'Morning batch','Mern Fullstack','2026-07-15','Partial',3600,5000,'Cash','Active','Santhosh',23600,5,5,32,'','','',''),(30,20000,'Morning batch','Mean Fullstack','2026-07-15','Partial',3600,3000,'Cash','Active','aananya',23600,7,7,33,'','','',''),(31,20000,'Morning batch','Mean Fullstack','2026-07-15','Pending',3600,0,'Cash','Active','thamizhan',23600,7,7,34,'','','',''),(32,20000,'Evening batch','Mevn Fullstack','2026-07-15','Paid',3600,23600,'Cash','Active','Makesh',23600,8,13,35,'','','',''),(33,20000,'Evening batch','Mevn Fullstack','2026-07-15','Paid',3600,23600,'Cash','Active','Mukesh',23600,8,13,36,'','','','');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor`
--

DROP TABLE IF EXISTS `instructor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor`
--

LOCK TABLES `instructor` WRITE;
/*!40000 ALTER TABLE `instructor` DISABLE KEYS */;
INSERT INTO `instructor` VALUES (1,'prabakar26@gmail.com',NULL,'Prabakaran','9675849043','JAVA','ACTIVE','$2a$10$Ds4MGIC8M/TYCdENd7VFFOAJPCSVgL4fbQlHE09R6oP9/jXr2lNLC','2026-07-31 11:47:55.357561'),(2,'palaniraj25@gmail.com',NULL,'Palani','8877655342','PYTHON','ACTIVE',NULL,NULL),(3,'srividhya72@gmail.com',NULL,'Sri Vidhya','9807654327','Mern stack','ACTIVE',NULL,NULL),(4,'vishpri1812@gmail.com',NULL,'Vishnu Priya','6358769034','Mevn Stack','ACTIVE',NULL,NULL),(5,'saravanan82@gmail.com',NULL,'Saravanan','9876543679','Testing/Devops','ACTIVE',NULL,NULL),(6,'venkatesh2824@gmail.com',NULL,'Venkatesh','8764590342','React /Mern','ACTIVE',NULL,NULL),(7,'kannan34@gmail.com',NULL,'Kannan','6234785916','Angular/ Mean','ACTIVE',NULL,NULL),(8,'elizabeth82@gmail.com',NULL,'Elizabeth','9098765432','C++','ACTIVE',NULL,NULL),(9,'bhuvaneswari43@gmail.com',NULL,'Bhuvaneswari','9644474343','Embedded systems','ACTIVE',NULL,NULL),(10,'vinothkumar56@gmail.com',NULL,'Vinoth Kumar','8957634203','VLSI Design','ACTIVE',NULL,NULL),(11,'saga83@gmail.com',NULL,'Sagadevan','9925855383','PCB Design','ACTIVE',NULL,NULL);
/*!40000 ALTER TABLE `instructor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `instructor_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `assignment_id` bigint NOT NULL,
  `type` enum('STARTED','DRAFT_SAVED','SUBMITTED') NOT NULL,
  `message` varchar(255) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notif_student` (`student_id`),
  KEY `fk_notif_assignment` (`assignment_id`),
  KEY `idx_notif_instructor` (`instructor_id`,`is_read`),
  CONSTRAINT `fk_notif_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignment` (`id`),
  CONSTRAINT `fk_notif_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructor` (`id`),
  CONSTRAINT `fk_notif_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_bank`
--

DROP TABLE IF EXISTS `question_bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_bank` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `encrypted_question` text NOT NULL,
  `question_order` int NOT NULL,
  `question_set` int NOT NULL,
  `assignment_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7b26kiohhsrelx2n4pfbq2fla` (`assignment_id`),
  CONSTRAINT `FK7b26kiohhsrelx2n4pfbq2fla` FOREIGN KEY (`assignment_id`) REFERENCES `assignment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_bank`
--

LOCK TABLES `question_bank` WRITE;
/*!40000 ALTER TABLE `question_bank` DISABLE KEYS */;
INSERT INTO `question_bank` VALUES (1,'2026-07-14 15:40:06.172006','GzcgZeGdlu0CkRq+9BuphCzHB6vy3qQUzXIFwVe8ceeO/RVF3gyMvi75D3qTNMAp28CZD0czykiPcOkF5y4jKU/hrPXq0X8JFk1ElsiYfzXFFHYfb6mo2fhE7ZHJhDtlZo2x9XfS0hSl5lvmtW3pAQ==',1,1,1),(2,'2026-07-14 15:40:06.239643','YJl8yjOKW3e+dr4Lj+VGm4d+3jxpa2OIlCRYZJHz2C8WA6px/q6IDcQt3m12w9GT8kRntIeSXlP1L4k3Pu/YkQpx7CANPSarVPfDG4yWJlg=',2,1,1),(3,'2026-07-14 15:40:06.303531','+L9XKitoc3l3jSjytxOtlmCKt/qAdqPzVeflXvqaLZY63VPnFg6faNkS9uRdEbWMCnHsIA09JqtU98MbjJYmWA==',3,1,1),(4,'2026-07-14 15:40:06.632442','rhEWZacVxEP7G5mXhA3W+N17MqExpVhM1XmRDoUip1TLMHNicqVYcAkQFn9ykRHyAzSrSk4cajEzBXQqWF628g==',4,1,1),(5,'2026-07-14 15:40:06.695950','WfaAKsu09crI58ZjPYcm8SWCjoFfp+dn1wtODcrudCbhd9zDpPRWqu/j34fMeV/8otuh0aC02Zw95deQgkRTE8BipGFKp0IaLRdHNnpszBs=',5,1,1),(6,'2026-07-14 15:40:06.731534','I4bW3N6N7zXO1iiLtnt1h4d+3jxpa2OIlCRYZJHz2C8uEv1rVrOMroO509IOrLd0QzQRRjH3A5/3uXIfVQ9QDT15Zw4kZSCyIILf8OhtDIoxcFrbbHOJZruoNRDS1WJh',6,2,1),(7,'2026-07-14 15:40:06.775495','CxHTIOakZQpbiM2hytXJLOumaTrrUExNa5UK9O5rzBoftLjycQ0N3o36+0/9s3IwdfhLwFhIa6rmhojdpOhsRhcOiaaEQDLEhht0rheTiwGy/ob5vGSK2nenO1ygKdUR',7,2,1),(8,'2026-07-14 15:40:06.814598','CxHTIOakZQpbiM2hytXJLBR1G5WZvI/1juypwYJwugqchiieI0OPyaAzPEbosOO+Hd9vJB8ShizOAwfdeskgRaBP/k7RMIRaGfGD3LOkjF9cfpG7TbwgYZmLJ+JAuJib',8,2,1),(9,'2026-07-14 15:40:06.849150','ux9AlCa+EGM118gj+IPK8wIboZT9cpl9CWEyXpInJzmUpjx47i2NUBV4SN8eetiF4NcidWteLP7qA9BfZtWgHkgaeqnYbZKB4+u94tedz1c=',9,2,1),(10,'2026-07-14 15:40:06.884132','DG8YDZeufbjVPVJW0TYXmvwNYu8y91RFhLP0/m3iEdt8gKRm+N16MdsVgUWVqfPwPMfkmBLGjYI1PyE7hzPBMQ==',10,2,1),(11,'2026-07-14 15:40:06.946107','RqpyYFCAJdVwS9FBrU83fsza654vbR9pV7xzpVbEgGYV8RZ9UMbMeik9g67xMW12H8Rwear+Akh/VyXgjqWfsA==',11,3,1),(12,'2026-07-14 15:40:07.006174','fJDoGvRdu8YpjftgLySV8co5EcfKEvnHslumSVtzsU096DM43JUEm0y+d6LweO3qWKeZu5tcmBwbIr07Yk1/gg==',12,3,1),(13,'2026-07-14 15:40:07.039376','zzYXj2ri4a9BQgf7O65wJEPx+Rm48SdpWYPQKts8qjzhd9zDpPRWqu/j34fMeV/8SK2H2asxFyXs92Shn/a6rL0esNLr8xA05WNvr7HwPYv7jGTzTwwhuTLFkE2TwZ7P',13,3,1),(14,'2026-07-14 15:40:07.089236','0Jgc3LLc+8G8F6IyzubFgEvNQAKOiUKmfkSuUqCojEBqQn0YiuKJuEtiyweNYOTjpBdnZKtlQS9bXXJ6w778cZ818CnpAY3vpKoGZukqrPsxcFrbbHOJZruoNRDS1WJh',14,3,1),(15,'2026-07-14 15:40:07.121443','0Jgc3LLc+8G8F6IyzubFgDrVLg8xU6C24fM+mSaP4+oGFO45efSRgNLuLzn+UPg3wxPcJWXIi24o9OYoFVji1HwoLrsLxMuVUnkZQ4IRvVv60la+kT/5uKGWPwpGpwX9LPUFqpC/eDqVs0nK63C78A==',15,3,1),(16,'2026-07-14 15:40:07.164054','pc8kNtswrn8JkwsU6f3ORcXnLK/68dJiqXMxaf9QvCCtVCIhz1nfPBjz0Bzxi6Z32Ino+quZOkyuUq6k3ZKFxe/Cdwv/XMAYmALrDumjkt8=',16,4,1),(17,'2026-07-14 15:40:07.196934','E6QdULhd4lwzGUE9Wss/msmo/MZP2xwP57BtfwfDkiKp2t8Yjn4KHbRjtplgVbVXwE5giE0uHNGL0yUZfTUysu/Cdwv/XMAYmALrDumjkt8=',17,4,1),(18,'2026-07-14 15:40:07.246963','E6QdULhd4lwzGUE9Wss/mii8/OVBI+ZuOVnwFYjIwTzijPJWUfRTV/ISFRzjA+JUM7Oeufu7zIrdLgR7uP+kN+ZQ7B0jwqUBCU7pFZQ53jCX3gAebaFWQ5zAXqzQhdL1',18,4,1),(19,'2026-07-14 15:40:07.290843','065sAZp0yPlWFjKrDb0FdLUZqV97JXbqU1GOdQKSAuIcfMdO83o3xRKhJD156+JziLkCV/oW1oVKXGTKHHnWimvKIP7eGV/vcKghRjlAolKX3gAebaFWQ5zAXqzQhdL1',19,4,1),(20,'2026-07-14 15:40:07.321741','Lxa76QRU+90T056IdGBO2IdCqh/+QmbdRcNQfoHwN+K2Ma2Lzr0vbaUUHP4z7AhJhcoF/0fITz7bBlnTNN4IA3w70Jq9QPs4vLLviikiGKxYfSNizO39Sxr+rI8m7pjA',20,4,1),(36,'2026-07-15 12:47:00.026560','c4mnx4vVzJnZNCqHhu6oZWZfVxRqP6GINgNJ5J1/wB0ftLjycQ0N3o36+0/9s3IwrfC16v0ViRmWFcJ1l05JkQzi2E4OQfZVSQRm76TaauWFwlPGQgZ1Gtm30J015TPRDdpO9BLAvXTjmtNkx2eWBg==',1,4,2),(37,'2026-07-15 12:47:00.159721','IAxvWl10A5lw4ysMpHIvw2ZfVxRqP6GINgNJ5J1/wB01oZv3h7dBVNPbIR4s68WUmPkQ0eJScpVBkWwvTgNDfqwomCarVYxhfBjx8DkA5b9YfSNizO39Sxr+rI8m7pjA',2,4,2),(38,'2026-07-15 12:47:00.215578','IAxvWl10A5lw4ysMpHIvw7aGppJYlbgpTLiiZ1xwo+fS6Bc2/UEiCBf0vSR9TzQ+K+l/uB0bF29H72E99V7VRDOmFAIxcCIPilBq/6AywFhZ7WW4gTGRS+AH7m5G4tNj',3,4,2),(39,'2026-07-15 12:47:00.252276','0W3TYTzOgH0sF6QiUww/3icvchN07E2G9fPYPFLe4hGjdiJO2r9hL6hAmXfUYSl2gEFQs9rRbF0FcQ0aFhwFzaPBI3Tdazl0sHgrVf/sj64=',4,4,2),(40,'2026-07-15 12:47:00.324913','0W3TYTzOgH0sF6QiUww/3volq81ERbVOQGn9RHJNVWG9G5iv5ZI7sykzA5y0GdcBp6X43WFZofoOkM9+3CDUxSreTefFv1+s3DzvAFVrhNAuXWq1lTTZ94GMlM8IjVC2G2hnIY8BNei2MMDjlaposA==',5,4,2),(117,'2026-07-21 12:35:49.908946','WYLwHFXG9IVE2C1Og5fTg0IaP44yWklEdemum90tG3wdlf6g98khMWozqAIiFTiukey5eo0YOnSxEI6mh1LDWQ==',1,1,3),(118,'2026-07-21 12:35:50.021923','MwZlQfKRzo/gbuJNi5vLmL5sVi0x5BhIKkuyYW6ZYnDaFL7ZMLwN8k3OCaIXwqTqOPdDrCQi/iHsCqCg1pSof2zThrIv5ki1r1jP4U5Y9p0=',2,1,3),(119,'2026-07-21 12:35:50.088932','7nHx+q9EJSpS+HxaXk1jfCe6M+zWlVQ1xMA9wrKE1ww5G/OfxuCtkTWCCALtZfexoBRqPohbe7qXz7Fb1X/TS6rnEJUVl5yUQZJYraeuwipBRg6aphUZlF70CeTiPmSC',3,1,3),(120,'2026-07-21 12:35:50.148609','QtAn23P3n72nQsOR9v/PeSYqUNbMCwaf7khf0E06V8brGModu5Q+7Bxl0CN8NADVNPjUs1xTJrQqsVRf6L8g3avF3nCPT7+gloYFTCGXoWA=',4,1,3),(121,'2026-07-21 12:35:50.215077','exTdOM96Jn7N2Go8gRQpQuIj9HgMZVM/eZACTiII4KMcMOhHHk5RA8SZsuXDg+D0PhluhhAwuD9DsrwBCs4n5j9nFBYwZ6FVhl08R00lAFDw+ogusw2xZC3ATDy9HxqK',5,2,3),(122,'2026-07-21 12:35:50.480879','4xBWuTxkkLuVDjzhzbhacSYqUNbMCwaf7khf0E06V8aY5ucVjuNqyK1CiT6Y8/qqzpr2gfr6so2on/sxSbecGw==',6,2,3),(123,'2026-07-21 12:35:50.620054','rbAzvjQgHtcAxO8QYNdobcXRiQ/XXporEduFNR93Qi/VWz/p97+xS5QegpYAMJCVXqw16dexKaEuZeiMDjqvwzlG4FKjY1S0C3/79siey9pKM+EECeeug+XOSdGf4wsyZo2x9XfS0hSl5lvmtW3pAQ==',7,2,3),(124,'2026-07-21 12:35:50.724444','RJjDxVfueRdkkhJYFA68v8XRiQ/XXporEduFNR93Qi98WmrS4yPl+eQjyK12zyuYwh/hnnqm4JiEgh/AlllukLQxqzto5cKua4RQ0J5Wzt7grefKSwPKWsuY5DmX0IxvZo2x9XfS0hSl5lvmtW3pAQ==',8,2,3),(125,'2026-07-21 12:35:50.787312','Ga9hwivownwmtLZIwyqUrC/DXKqF4ePW+w71sKu1Z9RrQ0vlxhTfRckQJPvSmvIPOMzqj93+4RPTe6xee/O9ftN2BqYAlM7H3woBTuwvpBFIl8B/q2ps4JdAUfRwhNBd',9,3,3),(126,'2026-07-21 12:35:50.831710','9lO4aCT+1sK/g5491swsXtmkqnOf07TsdHxr/+lzL+hcOHLMqITR5XepULc1/7IZScycibGWrEqDIiPlkM2xady5c1jjQ06/jitmomsYRg4DylSkg/aNbCB3cGUAFDnFLVcsqlAS0tHla9KELK+Qzg==',10,3,3),(127,'2026-07-21 12:35:50.906860','nQrul8wo1lCCnYVUwbSQqw5TxjgoNjE+ZCDO7iaD8T2Zi0MZqUjyI1hYx5onlnDChOrqRGEO4GW8oYLW1e4h7lqtgHl2Vbta/O1t2Z89SWcxW4xdS/dS0Hkk0q9bPF9B',11,3,3),(128,'2026-07-21 12:35:50.943220','6IlyYRN6kJYVEBqXfmBzqfaLDnrdrbneArTo1uoFm4Pwl7ndpHCqAa4SPWsM7NaVvMjCmwLVfkEVmbAyt+Jkj93zNY0+uBnmphpdu0rCNiAN4GAF7apwF0dbLrzURT6XMXBa22xziWa7qDUQ0tViYQ==',12,3,3),(129,'2026-07-21 12:35:51.012820','yWHpYd3bd67AKbmH2a4zAobBj7lwXSUSCOEmPFHAzE3vojW/o1/XiQfPrYhfQbCehV3ky6UB5JJKjuCKLN8UUv9f3pBFn0Q6Uyiw+Y5U7fymEqyGJnGZU5mi1XINZPOWMXBa22xziWa7qDUQ0tViYQ==',13,4,3),(130,'2026-07-21 12:35:51.052134','1q+R/hIbwM9NeMIGW5tjbCYqUNbMCwaf7khf0E06V8a1dyCEFTVMA2M1/bdarh+h8GZMtgAH/gJ2Z8KlH/ILr1ts1FSaoMEVjOmr+Es95hkbaGchjwE16LYwwOOVqmiw',14,4,3),(131,'2026-07-21 12:35:51.123368','3ZNoJjR2Sx8RsCrCoym0qNoPp/JIjO6Sr8bORZvzTHQPFon7wvogc1EWstxvnWtvkkzUAdHCIJfQt84YrgnQOpxzFR6bNFNkwvBnapb4fVwkIWzDxHmdmrDLlsAl0s9Q',15,4,3),(132,'2026-07-21 12:35:51.161364','oLvE2Kx147OcZhXLwN2AWQSf6UU/Q7pF0W0iUS1QqposOBBUgdyL54DTE8zmY567eXUr8ppPdLnBYY5AlnCkbNTH7FrT/HSnn4JRYaZXskc=',16,4,3),(133,'2026-07-28 15:39:37.011496','gOyWxRsxqFVHiKEHnBspJ0IaP44yWklEdemum90tG3yyak8YQEF79vlXtIZkx4wOuOWE9ToKWhMxC3UCQIxRqm7/5AXHdKhauL/2dHTfuj9MSdp2ufv3mQGlqvn3iNYnvP5NyRrSSzVc9zMNrBB8J2j67lctjxEm47GEQtFYd4M=',1,1,5),(134,'2026-07-28 15:39:37.080549','/nZoo/TeFyj9/K8CgpSsK3CRdWQfyk8i/N5wLNpaJir5yycqcSMr2ULVaIx8vmLMwPJRoTzCCY7iGzze1nXYqLmkC60MreVrN1d/tXPsgvqrz8hD5td3MXfHu20wQvdAqQUgbjJH9CE0jCyxEsVjH20jdRhqbkjgGGnc/bNiZPdATVILXZtag+KgoHa/3a4O',2,1,5),(135,'2026-07-28 15:39:37.259879','UZLKlNnyzjefcV2L2Qm+7b5sVi0x5BhIKkuyYW6ZYnDaFL7ZMLwN8k3OCaIXwqTqYuLCFqnrgFcyAEmhK6i5fzz7jV/5yx9sYK11Wst3r/Fu/+QFx3SoWri/9nR037o/TEnadrn795kBpar594jWJ7z+Tcka0ks1XPczDawQfCdo+u5XLY8RJuOxhELRWHeD',3,1,5),(136,'2026-07-28 15:39:37.302657','K/xpT+Zg2cqUT0wGj3Z2CeIj9HgMZVM/eZACTiII4KP/Q6khWBH36nrxgCzAxBWQ6qyN5z23XuhGfWKIGTygx5k4XOs7NmrL2QsJDs6m5ZwJER/5M1f+intjk/UVvJowPvCsk487FatQ2m+wktrUeRNQptb/gV36uhkqDT9jaHO38p1sJEk5AeZsCN7drVIc',4,1,5),(137,'2026-07-28 15:39:37.350738','PbGZs2srjMnZrT9g0SEUTiYqUNbMCwaf7khf0E06V8buLtGsfPjppNiqJFf/GDIvxhpl9pbMFb0Vcx7H3YyxbKvPyEPm13cxd8e7bTBC90CpBSBuMkf0ITSMLLESxWMfbSN1GGpuSOAYadz9s2Jk90BNUgtdm1qD4qCgdr/drg4=',5,1,5),(138,'2026-07-28 15:39:37.406492','W1NggcHwaH6LXuEDPpacZSe6M+zWlVQ1xMA9wrKE1wx2fSsOf3fFtXokOkkLK5j2NayMcVe3VKJRQq7/Eo3EZtth1tllG5Se7KG9qD6AHV0N0PooszASwNKmpnbKNotqt03OKLbQ7oCc5tQzESbarUw0IGlBqKoZFUZDXL2x3zvNbyyRvHF1lGliUH292J08V/IqwLn5tHcnXtDAmnUf+w==',6,2,5),(139,'2026-07-28 15:39:37.444471','nmNUkJopQczG1sq3m6414EbvFojQRDRS0jkaNhNgY/Iaqc7Ay1fRcDr3Z2evEgo87s2VQ67cb7VHN/7hMStlY6HBtKKMAnsnyOluCVoAWPiZtny6/Dhjl4F97Fwa0/LyXvotsQDFLGVZPjkpactsaeOGTyPLdkfBhk4KlTmR0Z6Fy2SdxaYpcd7sGSbcl9An',7,2,5),(140,'2026-07-28 15:39:37.492483','M3UegRAOOCQLEHsnNY5eHHCRdWQfyk8i/N5wLNpaJio4SVuFP6qzXcuw5KrdF/RundxEMq6XdrpAKJNEYCUvZjJDFda1Vz7T8U0cz0QPfx7qAt8i+W8GGFbP8dkx9eunbv/kBcd0qFq4v/Z0dN+6P0xJ2na5+/eZAaWq+feI1ie8/k3JGtJLNVz3Mw2sEHwnaPruVy2PESbjsYRC0Vh3gw==',8,2,5),(141,'2026-07-28 15:39:37.553384','FxPrk9HdAAFS4TyuNEn3Ob5sVi0x5BhIKkuyYW6ZYnB0u8Dr8Bqc0/ev6Tn9vtxEXuxvTUiqR/urDZQrdE1WIg8gI5AAsIezzLP23m9d8mcg86bE+mw+GvyvdXP+LKEl95lY3n1z5vFt35j4VuJggGS3GfobYyxDRZ0IVTMrOmb2weaZzZVhkQRDbjzTFhbAu4w7paQWuE3OIK93lgeQ4A==',9,2,5),(142,'2026-07-28 15:39:37.623204','/cR0qQe1BrbFHNI4ltj9qEbvFojQRDRS0jkaNhNgY/JvVKnBb6cBeeuvm8e8Qhlv04mJO16teewg+oXBQqP1231/ISKkZ0JFvsWKFrKuw/NvyBWwRdN236uA5uKv9F/Z7bEklo3Z6UivlLfayPh//cnLhK/tk3aA49xaCc2ZqXN2SyJZl7Oyr1tExVrdAx0TnjeKyMmTcWreJ7aXhNvKsw==',10,2,5),(143,'2026-07-28 15:39:37.707509','bYmaEdAR/7m2J8g5WtUevQ5TxjgoNjE+ZCDO7iaD8T1v5PahElsEXxk1kMvuNZqosawlHulwOfTtlGUfHDTIsORPkO65hIgWpQZvhZWuIjqJE7rxs5lM2Qd/Lwzd7NCY/FVMR0hh9+6qjcvtPHy9M1CgRYPWT54EW8UJ3Or+GIHvArwiRk7+hnHnLJoZK16HZo2x9XfS0hSl5lvmtW3pAQ==',11,3,5),(144,'2026-07-28 15:39:37.772282','lcP3kevoXtWTV0ZmiH1Mg/aLDnrdrbneArTo1uoFm4Pwl7ndpHCqAa4SPWsM7NaVrZEnOWSgiIdzGJhFnEVTSjarxMmubLWMwAQZozOgHraAJW/fDcbc/1+7fnnlhx5SqQUgbjJH9CE0jCyxEsVjH20jdRhqbkjgGGnc/bNiZPdATVILXZtag+KgoHa/3a4O',12,3,5),(145,'2026-07-28 15:39:37.820621','Hc+3fQinkevHvIe5uWIEPi/DXKqF4ePW+w71sKu1Z9S/Q8hwRqc9tDbCNXGm5rKkpMr1pDK2DuWV6KvTKK1odL+xbjWUFAFhLmSXtpCrpThu/+QFx3SoWri/9nR037o/TEnadrn795kBpar594jWJ7z+Tcka0ks1XPczDawQfCdo+u5XLY8RJuOxhELRWHeD',13,3,5),(146,'2026-07-28 15:39:37.897345','uEKGDX1d/hLKuO3GUfuhmdoPp/JIjO6Sr8bORZvzTHQPFon7wvogc1EWstxvnWtvrq4deWaLz+XYJBhPYyzyey4wkUzcc0tl9iv1tT+Jsf+v3Jds5dPy8oWUAfr3i/gJbv/kBcd0qFq4v/Z0dN+6P0xJ2na5+/eZAaWq+feI1ie8/k3JGtJLNVz3Mw2sEHwnaPruVy2PESbjsYRC0Vh3gw==',14,3,5),(147,'2026-07-28 15:39:37.956476','7lzbb+2DE9dKbAs7wIuap4bBj7lwXSUSCOEmPFHAzE3vojW/o1/XiQfPrYhfQbCehV3ky6UB5JJKjuCKLN8UUv9f3pBFn0Q6Uyiw+Y5U7fx4ntFiWkqhFEUZShF+ckOSk9Mr/6hP7kGoitOPzTVTqxmZaCrtHY3SFTc+tXxtRRWcl3M2yUIeIL0C/r68GrRfdPR8kNDBQSrHwf+1dbQiBg==',15,3,5),(148,'2026-07-28 15:39:38.006460','WI6l/ZgjS0HUVT996++XPASf6UU/Q7pF0W0iUS1Qqprhtk6VEYBWWOICLkC4cRJ/5Smqj4SPUFiEV/yKIN6VWe2xJJaN2elIr5S32sj4f/3Jy4Sv7ZN2gOPcWgnNmalzdksiWZezsq9bRMVa3QMdE543isjJk3Fq3ie2l4TbyrM=',16,4,5),(149,'2026-07-28 15:39:38.048916','NGXjEuY2nQdPuJ3/GmOSrUJYsb8beYOxirhfX7Jp9yyaNQETNtuoJRUrw/EM6UYEX6vHmT00/huWsG2V+QTpLIlO8WCASGfs7HLJDQxR9WWf/W6fUDi1U5hh0x7cS287CU2ISCzfKMGGaiKi0hyTXz7wrJOPOxWrUNpvsJLa1HkTUKbW/4Fd+roZKg0/Y2hzt/KdbCRJOQHmbAje3a1SHA==',17,4,5),(150,'2026-07-28 15:39:38.089959','SQ2S1eKhwlYMS/ilFxNd/kbvFojQRDRS0jkaNhNgY/JE7pfjLaE2gZuvJr/mGQ9btXsghhDg3vPJbqio4xMEIzUxXgTk1IavbGc2ds/M3zYU+bgLBMJ/H37b4orRHepm95lY3n1z5vFt35j4VuJggGS3GfobYyxDRZ0IVTMrOmb2weaZzZVhkQRDbjzTFhbAu4w7paQWuE3OIK93lgeQ4A==',18,4,5),(151,'2026-07-28 15:39:38.146628','ifVzPiKqTjqKLPA91ax8675sVi0x5BhIKkuyYW6ZYnAGCyD2M7+FXQZUC4qV1x9A7CZq51oR6tUB6d/qFLBrhKUmJRK/qw86mTBFSADeCPhAT1LgaiiaH+/re73aQzy6z5G1veFXtYzDjFpVcFiyE/xVTEdIYffuqo3L7Tx8vTNQoEWD1k+eBFvFCdzq/hiB7wK8IkZO/oZx5yyaGSteh2aNsfV30tIUpeZb5rVt6QE=',19,4,5),(152,'2026-07-28 15:39:38.198189','G+182f1D/S8d0rjZouU967ZVYvb1pihlchC4GDuirdjZTBWfbPCoDwXPhr6R5wqg0u8HjBI8bwlHCwUqFKkmtvJVSqxLJ/rfsq7t1TKvviMxelyRzD149An1aj24mc2eV6sllV8b6gtnFERerSKc+sDZroKVENPWe0Eyx7aVDQCG9NLbqDU/UvHiMZSNJDnfhmL8pBYAUVNqgYVo7sNxPQG7+jYriUwvbk5xsNYvuR98tfWaOxlvLZuyag5s6loC',20,4,5),(153,'2026-07-28 15:40:03.053202','FsWdzDLhrZ0vMkWJYo3CqsJd/8E30tzI51S7XWWAj+c9zG/n2jeaVH3p8vhJ/HqEhj7bd43oBB+eqzV18lYUUfuFkmnhwnP59eYpRkS4qBLTLP7hs/XbvCumf9aEVmij/aZoqZjuvC+VuQ1pBYnCqzFwWttsc4lmu6g1ENLVYmE=',1,1,4),(154,'2026-07-28 15:40:03.380978','XpUDMFH3qf/4Xq3/xV0tm9oPp/JIjO6Sr8bORZvzTHT28Uzll2Je5KJT+YAJEEu5LuwSrFIsSBErD0zQiP4/CiHNRGhNhnVdGZc8BB9HyRCAzp6c995Pzw0g4SVYEMepTDQgaUGoqhkVRkNcvbHfO81vLJG8cXWUaWJQfb3YnTxX8irAufm0dyde0MCadR/7',2,1,4),(155,'2026-07-28 15:40:03.488323','f/mdYQSkMdJWsEtMY5VfzXCRdWQfyk8i/N5wLNpaJiqS2ojY+4Fmni66w7YEOiG0A9gE0SOpP+Aa1Pq7NF5WOrds5F1bgW58NbTFh+mhlwirz8hD5td3MXfHu20wQvdAqQUgbjJH9CE0jCyxEsVjH20jdRhqbkjgGGnc/bNiZPdATVILXZtag+KgoHa/3a4O',3,1,4),(156,'2026-07-28 15:40:03.649013','FVQKy9BtRTIPPX85KnoRPkZOwh52MNYqGi7aQFPBawdpgrzZybtQmtFKZok/JucCim7jgl6CAlTmfSAuExl2i5/tBRifVBEBhXgUNNNr/HgM5A9o0k0qniyRk4Uqy51FqaTWA77fBbqUsytZmfny22ipB1ONq9BLUdzEaa0xSdGOf7MFWB/ioUtJWIVDu7a8dZeqYnlD5llL/XrG5guZBg==',4,1,4),(157,'2026-07-28 15:40:03.694499','wyqoOP5/Ns2pUQQR4l17q0ZOwh52MNYqGi7aQFPBawfeeNA4/FZ76oSOPnSBQE99honlI0MAXWJJl51oLkuRdSB32abkBn7YkzGvSHobX6KAzp6c995Pzw0g4SVYEMepTDQgaUGoqhkVRkNcvbHfO81vLJG8cXWUaWJQfb3YnTxX8irAufm0dyde0MCadR/7',5,1,4),(158,'2026-07-28 15:40:03.764905','pfe+W5FzSgG1bwkyx5ZSV0ZOwh52MNYqGi7aQFPBawdVR4gMzlpqFKxyUxQ6R2+mr9e8AB0VX74GFiTBx5GN5cDTLzhPi6VlayYfiGlEW8KppNYDvt8FupSzK1mZ+fLbaKkHU42r0EtR3MRprTFJ0Y5/swVYH+KhS0lYhUO7trx1l6pieUPmWUv9esbmC5kG',6,2,4),(159,'2026-07-28 15:40:03.802296','TcM6O5LC6MiQnksbGnStWEZOwh52MNYqGi7aQFPBawd26fvNkFMxDKzcogW+jN4Dx/8/BW0+WGPH9Gscfaxzb0Ko/CfhzqBXbkQRUCvDb+KG9NLbqDU/UvHiMZSNJDnfhmL8pBYAUVNqgYVo7sNxPQG7+jYriUwvbk5xsNYvuR98tfWaOxlvLZuyag5s6loC',7,2,4),(160,'2026-07-28 15:40:03.857057','zD0w8OYVhQ4Hb9B9TJmoCdQTReezMDGfsGAU5bmWXYHH1N/V7mrZ1ZUwdIxFtdHByaHSypbX4dpFedi2N0dHCZPTK/+oT+5BqIrTj801U6sZmWgq7R2N0hU3PrV8bUUVnJdzNslCHiC9Av6+vBq0X3T0fJDQwUEqx8H/tXW0IgY=',8,2,4),(161,'2026-07-28 15:40:03.936324','bIdK8Sja+uuhVg2UCbpvJkZOwh52MNYqGi7aQFPBawf+h+joNkBIICzLjY9nIRta2lWQtZwDPrrSCAxPKaYlq/nNaTtBMebQ5lL/qimmri73mVjefXPm8W3fmPhW4mCAZLcZ+htjLENFnQhVMys6ZvbB5pnNlWGRBENuPNMWFsC7jDulpBa4Tc4gr3eWB5Dg',9,2,4),(162,'2026-07-28 15:40:03.984960','rQ+o1bLPnC1Sv+fdTex9MEZOwh52MNYqGi7aQFPBawdpgrzZybtQmtFKZok/JucCHzTRkgTZkxlZM1chsVU/8zWm0iudDf2A30JusI0gWprUyXt+YS6CdqWaIa1TOViG+4WSaeHCc/n15ilGRLioEtMs/uGz9du8K6Z/1oRWaKP9pmipmO68L5W5DWkFicKrMXBa22xziWa7qDUQ0tViYQ==',10,2,4),(163,'2026-07-28 15:40:04.021877','pzftwSAgeCPtBGruNKF55EZOwh52MNYqGi7aQFPBawespuRrH8JMD/3e6nUv2RiPAQPaZh9neiZ8f1yvUS5F4lUX1q5g0hanJPhg5/9F/2FkdL7meEA10XlH1rlUMUKw8im8pvAJhvtY8nlaP+nfI3afJEL2e/nFZjQP7LFm+GmcETSfWKD+PFvlNVloH9tEHLZpWCo2lVZBpp8Z0ghfCA==',11,3,4),(164,'2026-07-28 15:40:04.090274','Ke/DphRUwzy32MRFuxXCSEZOwh52MNYqGi7aQFPBawdN0NyBfE/t6QwHZuhJhFfl3CaM1QeupLhVkiAvUW23bGR0vuZ4QDXReUfWuVQxQrDyKbym8AmG+1jyeVo/6d8jdp8kQvZ7+cVmNA/ssWb4aZwRNJ9YoP48W+U1WWgf20QctmlYKjaVVkGmnxnSCF8I',12,3,4),(165,'2026-07-28 15:40:04.171261','cUn0C62vOHYzpkQGoDNNf0ZOwh52MNYqGi7aQFPBaweCHUFRADkgFJvLj62ggMOHUzgZW4FDHKuaYxygLPYS9mngka/hDcOwYX6kaGaMnQv5wPQj08mhO+YI4UojiQDb+4WSaeHCc/n15ilGRLioEtMs/uGz9du8K6Z/1oRWaKP9pmipmO68L5W5DWkFicKrMXBa22xziWa7qDUQ0tViYQ==',13,3,4),(166,'2026-07-28 15:40:04.302182','XRxsuHg4Yu4CX6M1wBmJ9tQTReezMDGfsGAU5bmWXYEqfTaYXAvIT3+DYj6y9iocNH/Zqq+UbtedG+WrbD6lYE0IKg0f/AeoUd+O421Go8uLDpxyhFQGGdih7yvITwv5eddcVnAA2cgDGQ5G/GfYPqPYhFQ3ffpCi3bRAP2G3vuppNYDvt8FupSzK1mZ+fLbaKkHU42r0EtR3MRprTFJ0Y5/swVYH+KhS0lYhUO7trx1l6pieUPmWUv9esbmC5kG',14,3,4),(167,'2026-07-28 15:40:04.398504','aahfm7nDE4aj/6nqJIfJgEZOwh52MNYqGi7aQFPBaweJskgJ30AP4eKuBOF+Pdf/JNC6k3nA9oA9gVrtnhaNUMJu5RqBChRelBwYfivMTYkGnutisYqiuRlhW/E4PpbB6dkUvc1dq5REUZ//L+Sm/SEB1bzM22lRl5UnmpnAR36lj1WNXmIa1cM8AGJMtcGj',15,3,4),(168,'2026-07-28 15:40:04.459659','zKqx9/RTZ5/fJJVljz/JikZOwh52MNYqGi7aQFPBawdpgrzZybtQmtFKZok/JucCc8lHTJxY84sZPyesaOVFcxVS6O94SYr6Cff29U5ou/tQ6vEsavbboVvgVgO+bimTqQUgbjJH9CE0jCyxEsVjH20jdRhqbkjgGGnc/bNiZPdATVILXZtag+KgoHa/3a4O',16,4,4),(169,'2026-07-28 15:40:04.538088','rldwI/zuzhhBE1cF5AoIrUZOwh52MNYqGi7aQFPBawdpgrzZybtQmtFKZok/JucCpHFU7PXmZesUJGOVV/X3f0Z67/viG9Lm2u6aGNWUJs6hdwx7q88alxjA0rHMIv7CqaTWA77fBbqUsytZmfny22ipB1ONq9BLUdzEaa0xSdGOf7MFWB/ioUtJWIVDu7a8dZeqYnlD5llL/XrG5guZBg==',17,4,4),(170,'2026-07-28 15:40:04.586122','r+Ik2yuQYhqrPoM0B8QnZkZOwh52MNYqGi7aQFPBawdpgrzZybtQmtFKZok/JucCgB56OkmLBIo/11AUzIYsyBRdYi+2sR80iz58va//XbcGnutisYqiuRlhW/E4PpbB6dkUvc1dq5REUZ//L+Sm/SEB1bzM22lRl5UnmpnAR36lj1WNXmIa1cM8AGJMtcGj',18,4,4),(171,'2026-07-28 15:40:04.646323','E0kHG8pFu9EuqgOTtc9NrkZOwh52MNYqGi7aQFPBaweC4MF6CNIcYWY5TmoDm2Kk9nvffFLwsNEYwHvonZSVg9JhEvo5aemfb4OrBxlSrWOAPQpfBdnd/jwh5mYwxtYKz5G1veFXtYzDjFpVcFiyE/xVTEdIYffuqo3L7Tx8vTNQoEWD1k+eBFvFCdzq/hiB7wK8IkZO/oZx5yyaGSteh2aNsfV30tIUpeZb5rVt6QE=',19,4,4),(172,'2026-07-28 15:40:04.694306','eqZ5a8IROuMzd2zLsSLT0tQTReezMDGfsGAU5bmWXYFo3zeBtjCrIjaXK0ZeqH/O+mKcmfVzwY7oCgDaTQOYb452PjNTmAkZqnPtBgKlQWr7hZJp4cJz+fXmKUZEuKgS0yz+4bP127wrpn/WhFZoo/2maKmY7rwvlbkNaQWJwqsxcFrbbHOJZruoNRDS1WJh',20,4,4);
/*!40000 ALTER TABLE `question_bank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `age` int DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `student_code` varchar(255) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `date_of_birth` varchar(255) DEFAULT NULL,
  `pin_code` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `batch_id` bigint DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_pilb3uo1cimnf1sp86nqcrjsv` (`student_code`),
  KEY `FK17mfv6a26cwnmli2b6vm00dn7` (`batch_id`),
  CONSTRAINT `FK17mfv6a26cwnmli2b6vm00dn7` FOREIGN KEY (`batch_id`) REFERENCES `batch` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1,21,'sureshh13@gmail.com','suresh','STD001',_binary '','ACTIVE','No:677, santhoshpuram east st.','Chennai',NULL,NULL,'Tamil Nadu',1,'$2a$10$Q7OR4g7XKTJGKIqcd/0SruAA7QCyTMUs/cAplhAYvCx9EihoJTbTS','2026-07-23 14:34:43.398127'),(2,20,'sureshh133@gmail.com','suresh','STD002',_binary '','ACTIVE','No:887, shanmugapuram colcony ','vellore',NULL,NULL,'Tamil Nadu',2,NULL,NULL),(3,20,'kumar14@gmail.com','kumar','STD003',_binary '','ACTIVE','No:69, Ranganathan st.','villupuram',NULL,NULL,'Tamil Nadu',1,NULL,NULL),(4,20,'kumar144@gmail.com','kumar','STD004',_binary '','ACTIVE','','vellore',NULL,NULL,'Tamil Nadu',4,NULL,NULL),(5,20,'ravikumar15@gmail.com','Ravi kumar','STD005',NULL,'ACTIVE',NULL,'Cuddalore',NULL,NULL,NULL,2,'$2a$10$FzABEkEKOIcENcpIFbXLNOR.oKqmDXZ9lV/lpldBK.MF/lVBei2vO',NULL),(6,21,'ram16@gmail.com','ram','STD006',NULL,'ACTIVE',NULL,'Madurai',NULL,NULL,NULL,1,'$2a$10$qf58pV7O6epTZTtc.SsX5OEG2o9v4MZDl.M806EPA6haWcBBwQfDu','2026-07-28 12:16:43.564349'),(7,21,'rajesh17@gmail.com','rajesh','STD007',_binary '','ACTIVE','No:807,vallar st,','villupuram',NULL,NULL,'Tamil Nadu',1,'$2a$10$VYwxj8JRXodkf8xShbyQxu9E0alfdFqerV8ykNUgTzErIjOli.5x6','2026-07-28 12:20:23.719674'),(8,22,'mega17@gmail.com','mega','STD008',NULL,'ACTIVE',NULL,'Coimbatore',NULL,NULL,NULL,1,'$2a$10$Xiro/CZ2s4NvdcQZLEFa7uyFpH2a.8qNsAlGYqg9vnU5/HN5O7eFi','2026-07-28 12:05:44.348770'),(9,23,'prabha23@gmail.com','Prabha','STD009',NULL,'ACTIVE',NULL,'Pollachi',NULL,NULL,NULL,2,'$2a$10$heDj5XOYlW8mzi3U55qsnuJm916pazfNRhCr7Q88lCfZbYBW2j2Gy','2026-07-28 12:05:56.308148'),(11,22,'sreesri24@gmail.com','sree','STD011',_binary '','ACTIVE','No:677, santhoshpuram east st.','Chennai',NULL,NULL,'Tamil Nadu',2,'$2a$10$9qRF6nuVVkpO1KmLFGAqF.BKHFjaYZu1Mt5JpissaJWdC/7a8XFzy',NULL),(12,21,'sivagi13@gmail.com','sivagi','STD012',_binary '','ACTIVE',NULL,'Kakinada',NULL,NULL,NULL,1,'$2a$10$Pc/X5mCLgdDJhmPIHswvxO4//uz9Z1JsJHxnVwOiyHUGT4vQHY9WW',NULL),(13,22,'raghu14@gmail.com','Raghu','STD0113',_binary '','ACTIVE',NULL,'kanchipuram',NULL,NULL,NULL,1,'$2a$10$pd5CW0ATC8vjJPYYHf5gyef7EICYedZlM.XuvioSL64ZTC0IU6jxe','2026-08-04 10:13:51.575622'),(14,23,'srinidhi14@gmail.com','shrinidhi','STD0114',_binary '','ACTIVE',NULL,'kumbakonam',NULL,NULL,NULL,2,'$2a$10$4RXyTXPjJval10tKABq85OmKDdt1QQhm0nenJBFYvl9vRCHE7m9Hq','2026-07-28 12:55:06.016696'),(15,26,'sathya34@gmail.com','sathya','STD0115',_binary '\0','ACTIVE',NULL,'Mana Madurai',NULL,NULL,NULL,2,'$2a$10$w/PTdGKXWqYA37s0c3podevlJLGu6xmc0y8KytwIbULn06qE3N2em','2026-07-28 12:48:42.485958'),(16,25,'bhagavathi43@gmail.com','bagavathiragan','STD0116',_binary '','INACTIVE',NULL,'Trichy',NULL,NULL,NULL,1,'$2a$10$8ckt8XMee41hirhYpmgysOZgO5QMOiZ/FBAayajLMDkTXVyCuIhZ.','2026-07-28 12:02:14.542948'),(17,26,'barathii44@gmail.com','barathi','STD0117',_binary '','ACTIVE',NULL,'Virudhachalam',NULL,NULL,NULL,2,'$2a$10$ACvxa2WxntzOsDfAaFVhP.B8xQTs44QzwOk6oJ3l7BOOFYeqiqFZ6','2026-07-28 16:11:06.791336'),(18,21,'harikrish32@gmail.com','Harikrishnan','STD0118',_binary '','ACTIVE',NULL,'Thitakudi',NULL,NULL,NULL,1,'$2a$10$Kq2JcdsQcwefRDk8hsda7.xWoTaCr/CvnxjxpTfkIeja1rl8IFb7O','2026-08-03 11:09:04.103419'),(19,20,'diviya43@gmail.com','Diviya','STD0119',_binary '','ACTIVE',NULL,'Samayapuram',NULL,NULL,NULL,2,'$2a$10$rwZ4WTcbE755n2rUP/mCOuxTA9PvgmuI93IyB9h9ntGGXINTOLh9e','2026-07-28 12:01:35.208469'),(20,22,'bhuvana34@gmail.com','Bhuvana','STD0120',_binary '','INACTIVE',NULL,'Thirunelveli',NULL,NULL,NULL,6,'$2a$10$3RE6UdwderiVSZLIz8mh/OXhMC.V9gDUJANO.2/apPk0t4K3jld.G','2026-07-28 12:02:24.363775'),(21,23,'indhu34@gmail.com','Indhu','STD0121',NULL,'ACTIVE',NULL,'kallakurichi',NULL,NULL,NULL,5,'$2a$10$0.A5InIDyrDTeU9bDPC2Ue4Zdvw6ZL5aPoh/g4xE4Vcz.bdsmhqiG','2026-07-28 12:05:33.627826'),(28,20,'revathi12@gmail.com','Revathi','STD122',NULL,'ACTIVE',NULL,'villupuram',NULL,NULL,NULL,2,'$2a$10$8fjCcmCXFnlA/RRJaUEeA.vwv0LzJP3x9Pn1v5dzoBbNci8fu.eU.','2026-07-28 12:20:33.839503'),(29,20,'srisivahari21@gmail.com','Srisiva Hari','STD123',NULL,'ACTIVE',NULL,'thiruvarur',NULL,NULL,NULL,5,'$2a$10$zvOfAryqrMDLGZeCUYkc..QiUzsa7rheQhrBpuk6oMF3royyjF2JS','2026-07-28 12:27:18.543827'),(30,21,'madhav24@gmail.com','Madhav','STD124',NULL,'ACTIVE',NULL,'kanchipuram',NULL,NULL,NULL,7,'$2a$10$0SksBaZ9HDQQSm8xPC0JiOBEBRTAxSSZRHnneuuQkVHyh5SGMa7aK','2026-07-28 16:13:09.389556'),(31,20,'kowshika34@gmail.com','Kowshika','STD125',NULL,'ACTIVE',NULL,'thindivanam',NULL,NULL,NULL,4,NULL,NULL),(32,18,'santhosh35@gmail.com','Santhosh','STD126',NULL,'ACTIVE',NULL,'thanjavur',NULL,NULL,NULL,5,'$2a$10$iXeuYe4KhB98WKekTjmpU.4A3Fr9FN70D2WAYZki46yL3H2RO53jy','2026-07-28 12:23:58.207293'),(33,19,'aanan36@gmail.com','aananya','STD127',NULL,'ACTIVE',NULL,'chennai',NULL,NULL,NULL,8,NULL,NULL),(34,19,'thamizan64@gmail.com','thamizhan','STD128',NULL,'ACTIVE',NULL,'karikal',NULL,NULL,NULL,8,NULL,NULL),(35,19,'makesh76@gmail.com','Makesh','STD129',NULL,'ACTIVE',NULL,'karur',NULL,NULL,NULL,8,NULL,NULL),(36,20,'mukesh87@gmail.com','Mukesh','STD130',NULL,'ACTIVE',NULL,'kovilpati',NULL,NULL,NULL,8,NULL,NULL);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_assignment`
--

DROP TABLE IF EXISTS `student_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_assignment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assigned_set` int DEFAULT NULL,
  `content` text,
  `feedback` text,
  `file_url` varchar(255) DEFAULT NULL,
  `graded_at` datetime(6) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `marks_obtained` int DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','SUBMITTED','LATE','GRADED') NOT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `tried_sets` varchar(255) DEFAULT NULL,
  `assignment_id` bigint NOT NULL,
  `graded_by` bigint DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK49cnejw7440elks7xii1fj60i` (`assignment_id`,`student_id`),
  KEY `FKhi4fm6dk6v8okbhfy1ghsvvst` (`graded_by`),
  KEY `FKtot1fbwsuvupu0m81fc1n2en2` (`student_id`),
  CONSTRAINT `FKhi4fm6dk6v8okbhfy1ghsvvst` FOREIGN KEY (`graded_by`) REFERENCES `instructor` (`id`),
  CONSTRAINT `FKp1s5ejhej7y8tb13r1xjs916` FOREIGN KEY (`assignment_id`) REFERENCES `assignment` (`id`),
  CONSTRAINT `FKtot1fbwsuvupu0m81fc1n2en2` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_assignment`
--

LOCK TABLES `student_assignment` WRITE;
/*!40000 ALTER TABLE `student_assignment` DISABLE KEYS */;
INSERT INTO `student_assignment` VALUES (1,1,'{\"1\":\"reactDOM.createRoot()\",\"2\":\"facebook\",\"3\":\"javascript library\",\"4\":\"javascript file\",\"5\":\"usestate\"}','good',NULL,'2026-07-14 17:24:11.056671',NULL,8,'GRADED','2026-07-14 17:20:18.403994','1',1,6,1),(2,4,'{\"36\":\"final\",\"37\":\"new thread\",\"38\":\"override\",\"39\":\"java sql\",\"40\":\"break\"}','good',NULL,'2026-07-28 11:57:48.702572',NULL,7,'GRADED','2026-07-15 12:50:12.486342','4',2,1,5),(3,1,'{\"1\":\"render()\",\"2\":\"meta / facebook\",\"3\":\"javascript library\",\"4\":\"javascript xml\",\"5\":\"usestate\"}','learn',NULL,'2026-07-28 14:09:35.325853',NULL,6,'GRADED','2026-07-28 12:16:37.793340','1,2,4',1,6,6),(4,4,'{\"36\":\"final\",\"37\":\"new\",\"38\":\"@override\",\"39\":\"java.sql\",\"40\":\"break\"}','good',NULL,'2026-07-28 12:59:12.637032',NULL,5,'GRADED','2026-07-21 12:21:43.292600','3,4',2,1,17),(5,1,'{\"1\":\"render()\",\"2\":\"facebook\",\"3\":\"javascript library\",\"4\":\"javasprict XML\",\"5\":\"usestate\"}','learn ',NULL,'2026-07-21 13:56:36.588408',NULL,6,'GRADED','2026-07-21 12:26:31.380992','1',1,6,16),(6,4,'{\"36\":\"final\",\"37\":\"new\",\"38\":\"@override\",\"39\":\"java.sql\",\"40\":\"break\"}','pratice',NULL,'2026-07-28 12:59:33.755792',NULL,7,'GRADED','2026-07-21 12:29:59.336238','1,4',2,1,19),(7,2,'{\"6\":\"Capital letter\",\"7\":\"function\",\"8\":\"index.js\",\"9\":\"virtual DOM\",\"10\":\"single element\"}','pratice',NULL,'2026-07-21 13:56:55.739010',NULL,7,'GRADED','2026-07-21 12:32:22.806836','2',1,6,18),(8,4,'{\"53\":\"mongoose\",\"54\":\"npm\",\"55\":\"200\",\"56\":\"collections and Documents\"}','good',NULL,'2026-07-28 12:57:43.703431',NULL,13,'GRADED','2026-07-21 12:35:01.096896','4',3,3,21),(9,4,'{\"16\":\"JSX\",\"17\":\"<> </>\",\"18\":\"key\",\"19\":\"no\",\"20\":\"use state\"}','focus',NULL,'2026-07-21 13:47:30.481732',NULL,5,'GRADED','2026-07-21 12:38:10.721350','4',1,6,8),(10,1,'{\"1\":\"render ()\",\"2\":\"facebook\",\"3\":\"javascript library\",\"4\":\"javascript XML\",\"5\":\"useState\"}','pratice',NULL,'2026-07-21 13:48:00.938906',NULL,6,'GRADED','2026-07-21 12:39:31.706887','1',1,6,13),(11,1,'{\"1\":\"render()\",\"2\":\"facebook\",\"3\":\"javascript library\",\"4\":\"javascript XML\",\"5\":\"useState\"}','focus',NULL,'2026-07-21 13:46:55.625878',NULL,5,'GRADED','2026-07-21 12:40:45.877256','1',1,6,7),(12,4,'{\"36\":\"final\",\"37\":\"thread\",\"38\":\"@override\",\"39\":\"java.sql\",\"40\":\"break\\n\"}','good',NULL,'2026-07-28 12:59:49.895178',NULL,8,'GRADED','2026-07-28 12:23:20.150637','3,4',2,1,28),(13,3,'{\"11\":\"Immutable\",\"12\":\"mutable\",\"13\":\"useEffect\",\"14\":\"props\",\"15\":\"useref\"}',NULL,NULL,NULL,NULL,NULL,'LATE','2026-07-21 14:31:36.714788','3',1,NULL,12),(14,4,'{\"36\":\"final\",\"37\":\"thread\",\"38\":\"@override\",\"39\":\"java sql\",\"40\":\"break\"}','good',NULL,'2026-07-28 12:58:40.260826',NULL,8,'GRADED','2026-07-28 12:13:08.285210','4',2,1,9),(15,2,'{\"121\":\"Node.js\",\"122\":\"JavascriptXML\",\"123\":\"usestate\",\"124\":\"useeffect\"}','good',NULL,'2026-07-28 12:58:10.205295',NULL,12,'GRADED','2026-07-28 12:26:58.767242','2',3,3,32),(16,1,'{\"117\":\"MongoDB, Express.js, React, Node.js\",\"118\":\"MongoDB\",\"119\":\"React\",\"120\":\"Backend\"}','good',NULL,'2026-07-28 12:57:57.372640',NULL,13,'GRADED','2026-07-28 12:33:39.676428','1',3,3,29),(17,4,'{\"36\":\"final\",\"37\":\"thread\",\"38\":\"@override\",\"39\":\"Java.sql\",\"40\":\"break\"}','pratice',NULL,'2026-07-28 12:58:57.330765',NULL,7,'GRADED','2026-07-28 12:54:52.702067','1,2,3,4',2,1,15),(18,4,'{\"36\":\"final\",\"37\":\"thread\",\"38\":\"@override\",\"39\":\"java.sql\",\"40\":\"break\\n\"}',NULL,NULL,NULL,NULL,NULL,'LATE','2026-07-28 16:10:56.005047','1,4',2,NULL,14);
/*!40000 ALTER TABLE `student_assignment` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-10 11:47:52

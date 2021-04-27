drop table if exists things;
create table things (
	id int(11) not null auto_increment primary key,
	thing_id varchar(20) not null,
	user_id int(11) not null,
	name varchar(100) null default '',
	imageFile varchar(100) null default '',
	parentId varchar(20) null default null,
	print tinyint(1) null default 0,
	`type` varchar(20) null default '',
	sku_min_qty int(11) null default null,
	sku_qty int(11) null default null,
	qty int(11) null default null,
	type_data varchar(200) null default '',
	rack_rows int(11) null default null,
	rack_cols int(11) null default null,
	rack_position varchar(4) null default '',
	imageData text null default null,
	time_created int(11) null default null,
	time_modified int(11) null default null,
	time_scanned int(11) null default null
);


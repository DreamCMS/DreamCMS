<?php

/**
 * DreamCMS 3.0
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * PHP Version 5
 *
 * @package      Logs
 * @version      3.0.0 Beta
 * @category     Longpoll
 * @copyright    2008-2013 Marcel Domke
 * @license      http://www.gnu.org/licenses/gpl-2.0.txt GNU GENERAL PUBLIC LICENSE Version 2
 * @author       Marcel Domke <http://www.dcms-studio.de>
 * @link         http://www.dcms-studio.de
 * @file         Getlog.php
 */
class Logs_Longpoll_Getlog
{

	/**
	 *
	 * @var WebSocketUser
	 */
	public $WebSocketUser = null;

	/**
	 *
	 */
	public function __construct ()
	{

		$addr                = Settings::get('portalurl');
		$addr                = preg_replace('#https?://#', '', $addr);
		$this->WebSocketUser = new WebSocketUser($addr, '9000');
	}

	/**
	 * @param Longpoll $poller
	 */
	public function getData ( Longpoll $poller )
	{

		$this->initPoller($poller);

		// Execute
		$data = $this->execute();


		$this->WebSocketUser->$this->send($this, $data); //->send();
	}

}

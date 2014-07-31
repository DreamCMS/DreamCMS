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
 * @package      Widgets
 * @version      3.0.0 Beta
 * @category     Action
 * @copyright    2008-2013 Marcel Domke
 * @license      http://www.gnu.org/licenses/gpl-2.0.txt GNU GENERAL PUBLIC LICENSE Version 2
 * @author       Marcel Domke <http://www.dcms-studio.de>
 * @link         http://www.dcms-studio.de
 * @file         Refresh.php
 */
class Widgets_Action_Refresh extends Widgets_Helper_Base
{

	public function execute ()
	{

		$arr = $this->get_user_widget_by_id($this->input('id', 'int'));
		if ( !isset($arr[ 'widget' ]) )
		{
			throw new BaseException('Widget was not found! ID:' . $this->input('id', 'int'));
		}

		$output = $this->runWidget($arr[ 'widget' ], $arr[ 'id' ]);
	}

}

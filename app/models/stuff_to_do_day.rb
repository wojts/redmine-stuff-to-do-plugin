class StuffToDoDay < ActiveRecord::Base
  unloadable

  belongs_to :stuff, :polymorphic => true
  belongs_to :user
  acts_as_list :scope => :user

  def self.user_for_period(user, range)
    self.where(:user_id => user.id, :scheduled_on => range)
  end

  def self.save_days(user, days_params)
    Rails.logger.info days_params.inspect
    days = days_params.keys.compact
    self.where(:user_id => user.id, :scheduled_on => days).destroy_all
    days_params.each do |day, items|
      items.each do |position, item|
        id = item[:id].gsub('stuff_', '')
        if id.match(/project/i)
          type = 'Project'
          id = id.sub(/project/i,'')
        else
          type = 'Issue'
          id = id
        end

        StuffToDoDay.new.tap do |stdd|
          stdd.user_id = user.id
          stdd.scheduled_on = day
          stdd.position = position
          stdd.stuff_id = id.to_i
          stdd.stuff_type = type
          stdd.hours = item[:hours]
        end.save!
      end
    end
  end
end

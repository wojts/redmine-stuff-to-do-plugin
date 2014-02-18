class StuffToDoDay < ActiveRecord::Base
  unloadable

  belongs_to :stuff, :polymorphic => true
  belongs_to :user
  acts_as_list :scope => :user

  def self.user_for_week_starting(user, start_date)
    end_date = start_date + 6.days
    scoped.where(:user_id => user.id, :scheduled_on => start_date..end_date)
  end

  def self.save_days(user, days_params)
    Rails.logger.info days_params.inspect
    days = days_params.keys.compact
    scoped.where(:user_id => user.id, :scheduled_on => days).destroy_all
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

        StuffToDoDay.create(
          :user_id => user.id,
          :scheduled_on => day,
          :position => position,
          :stuff_id => id.to_i,
          :stuff_type => type,
          :hours => item[:hours]
        )
      end
    end
  end
end

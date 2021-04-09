import DateUtil from '../utils/dateUtils';
import Events, { Emotion, Gluten, Severity } from '../constants/Events';

export default class WeeklyReportData {

  constructor(dataBase) {
    this.previousWeekEventCounter = {}
    this.currentWeekEventCounter = {}
    this.bestDay = {}
    this.events = []
    this.currentWeekStart = {}
    this.currentWeekEnd = {}
    this.previousWeekStart = {}
    this.thisTimePreviousWeek = {}
    this.dataBase = dataBase
    this.enrichedDays = []
  }

  init = (startOfWeek, endOfWeek, now) => {
    this.now = now || new Date()
    this.currentWeekStart = startOfWeek || DateUtil.getStartOfThisWeekBeginningMonday()
    this.currentWeekEnd = endOfWeek || DateUtil.getEndOfThisWeekBeginningMonday()
    this.previousWeekStart = DateUtil.getStartOfPreviousFullWeekBeginningMonday(this.now)
    this.thisTimePreviousWeek = DateUtil.sameTimeAWeekPrevious(this.now)

    return this.getData(this.previousWeekStart, this.currentWeekEnd);
  }

  scoreEvent = (event) => {

    switch (event.eventType) {
      case Events.Symptom: {
        const scores = {
          [Severity.LOW]: 1,
          [Severity.MODERATE]: 2,
          [Severity.SEVERE]: 3,
        }

        if (event.objData.symptomID === 0) return 5;

        return event.objData.severity in scores ? scores[event.objData.severity] : 0;
      }

      case Events.Food: {
        const scores = {
          [Gluten.FREE]: 1,
          [Gluten.UNKNOWN]: 0.5,
          [Gluten.PRESENT]: 0,
        }
        return event.objData.tag in scores ? scores[event.objData.tag] : 0;
      }

      case Events.Emotion: {
        const scores = {
          [Emotion.HAPPY]: 5,
          [Emotion.SLIGHTLY_HAPPY]: 4,
          [Emotion.NEUTRAL]: 3,
          [Emotion.SLIGHTLY_UNHAPPY]: 2,
          [Emotion.UNHAPPY]: 1,
        }
        return event.objData.type in scores ? scores[event.objData.type] : 0;
      }

      case Events.GIP: {
        return 1;
      }
    }
  }


  jsonifyEvent = (event) => {
    event.objData = JSON.parse(event.objData)
    event.created = new Date(event.created)
    event.modified = new Date(event.modified)
    return event
  }

  getData = (startOfPeriod, endOfPeriod) => {
    return this.getEventsBetweenDatesInclusive(startOfPeriod, endOfPeriod)
      .then(data => {
        this.events = data
          .filter(event => event.eventType !== Events.LogEvent)
          .map(this.jsonifyEvent)
        this.calcBestDay()
      })
      .catch(err => console.log("Report data access error:", err.message));
  }

  getEventsBetweenDatesInclusive = (start, end) =>
    new Promise((resolve, reject) => {
      this.dataBase.fetchEventsBetween(
        start,
        end,
        () => reject("Error fetching events for previous 7 days"),
        (_, { rows: { _array } }) => resolve(_array),
      );
    })

  TARGET_DAILY_SCORE = 9
  TARGET_MEALS_PER_DAY = 3
  TARGET_SYMPTOMS_PER_DAY = 3
  TARGET_EMOTIONS_PER_DAY = 3

  targetActivityCounter = (day) =>
    Math.min(day.mealCount, this.TARGET_MEALS_PER_DAY) +
    Math.min(day.emotionCount, this.TARGET_EMOTIONS_PER_DAY) +
    Math.min(day.symptomCount, this.TARGET_SYMPTOMS_PER_DAY)

  activityRateForDay = (dayOfWeek) => this.enrichedDays[dayOfWeek].activity
  
  eventInCurrentWeek = (event) => event.created > this.currentWeekStart && event.created < this.currentWeekEnd

  scoreDay = (dayEvents) => dayEvents.reduce(
    (sum, event) => this.scoreEvent(event) + sum,
    0
  )

  calcBestDay = () => {

    var dayEvents = new Array(7).fill(null).map(()=> ({ date: "", events: [] }))

    eventsGroupedIntoDays =
      this.events
        .filter(this.eventInCurrentWeek)
        .reduce((days, event) => {
          var key = DateUtil.dayOfWeek(event.created)
          days[key].date = DateUtil.justDate(event.created)
          days[key].events.push(event)
          return days
        }, dayEvents
        )

    this.enrichedDays = Object.keys(eventsGroupedIntoDays)
      .map(key => eventsGroupedIntoDays[key])
      .map(day => (
        {
          ...day,
          score: this.scoreDay(day.events),
          mealCount: this.countEventsOfTypeOnADay(Events.Food, day.date),
          emotionCount: this.countEventsOfTypeOnADay(Events.Emotion, day.date),
          symptomCount: this.countEventsOfTypeOnADay(Events.Symptom, day.date),
          gipTests: this.countEventsOfTypeOnADay(Events.GIP, day.date),
        }))
      .map(day => ({
        ...day,
        activity: this.targetActivityCounter(day)/this.TARGET_DAILY_SCORE
      }))

    this.bestDay = this.enrichedDays.reduce((bestDay, thisDay) => bestDay.score > thisDay.score ? bestDay : thisDay)
    console.log("enriched days", this.enrichedDays)
    console.log("best days", this.bestDay)
  }


  countEventsOfTypeOnADay = (type, date) => {
    start = new Date(date)
    start.setHours(0, 0, 0, 0);
    end = new Date(date)
    end.setHours(23, 59, 59, 999);
    return this.countEventsOfTypeBetweenDates(type, start, end)
  }

  countEventsOfTypeBetweenDates = (type, start, end) =>
    this.events
      .filter(event => event.created > start && event.created < end)
      .filter(event => event.eventType == type)
      .length

  bestDayDate = () => this.bestDay.date
  bestDaySymptomCount = () => this.bestDay.symptomCount;
  bestDayMoodCount = () => this.bestDay.emotionCount;
  bestDayMealCount = () => this.bestDay.mealCount;
  bestDayGipTests = () => this.bestDay.gipTests;

  thisWeekGIPCount = () => this.countEventsOfTypeBetweenDates(Events.GIP, this.currentWeekStart, this.currentWeekEnd)
  thisWeekSymptomCount = () => this.countEventsOfTypeBetweenDates(Events.Symptom, this.currentWeekStart, this.currentWeekEnd)
  thisWeekMoodCount = () => this.countEventsOfTypeBetweenDates(Events.Emotion, this.currentWeekStart, this.currentWeekEnd)
  thisWeekMealCount = () => this.countEventsOfTypeBetweenDates(Events.Food, this.currentWeekStart, this.currentWeekEnd)

  //these only count up to the current Day/Time last week
  previousWeekGIPCount = () => this.countEventsOfTypeBetweenDates(Events.GIP, this.previousWeekStart, this.thisTimePreviousWeek)
  previousWeekSymptomCount = () => this.countEventsOfTypeBetweenDates(Events.Symptom, this.previousWeekStart, this.thisTimePreviousWeek)
  previousWeekMoodCount = () => this.countEventsOfTypeBetweenDates(Events.Emotion, this.previousWeekStart, this.thisTimePreviousWeek)
  previousWeekMealCount = () => this.countEventsOfTypeBetweenDates(Events.Food, this.previousWeekStart, this.thisTimePreviousWeek)
};
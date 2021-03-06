# document-classifier

Это не классический README о проекте, а просто запись мыслей и план дальнийших действий.

## Этап 1. Клонирование существующей программы

На данный момент реализован алгоритм классификации, что был в моей курсовой работе, с некоторыми поправками на usability.

Алгоритм имеет такой поток выполнения:

* __Этап подготовки данных__
* Программа внутри каждой папки случайным образом разделяет документы на 2 кучи: классифицированные и те, что необходимо распознать.
Сейчас это разбиение составляет 80% и 20% соответственно;
* По всем известным документам строится словарь уникальных слов (обычный `HashMap`);
* Для каждой папки документов получаем маски этих самых папок с помощью словаря;
Маска представляет из себя (большой массив из `0` и `1`, где `0` – слова нет в словаре и `1`, если оно там есть). За позиции
слов в маске отвечает сам словарь;
* По каждой маске строится нейрон;
* __Этап классификации__
* Для каждого нераспознанного документа создается маска
* Каждая маска тестируется на всех нейронах
* Документ принадлежит тому типу нейрона, который распознает документ сильнее всего
* По этим данным собирается статистика

На данный момент качество классификации нейронов плохое:
<img src="https://i.imgur.com/deUJZc5.png" width=600/>

На это есть множество причин. Перечислю:
* ~Словарь содержит очень много мусорных слов, к примеру: `gfk jta vpd isc rit`.
  Это какие-то слова в шапке письма, разбитый на части адрес почты и т.д. Уровень классификации на данных "без мусора" ожидается лучше.
  Возможно, стоит фильтровать слова через словарь настоящих английских слов. А, может, совсем перейти на такой словарь и не подсчитывать
  по документам.~ Также частая практика: отфильтровывать слова с низкой частотой встречаний;
* ~Нужен стеминг (унисексация) слов [ссылка](http://snowball.tartarus.org/)~
* ~Все слова сейчас имеют одинаковый вес. Однако, есть часто встрчающиеся слова: `in I is the...`, а есть специфичные для данного текста.
Нужно каждой группе слов задать свой вес. Так, например, предлоги будут иметь ничтожный вес, а специальные термины – огромный.~
Для такой реализации нужен словарь, в котором будет указана "природа слова".
~Дополнительно можно учитывать количество используемых слов и удалять редкие.~
* На данный момент нейроны имеют алгоритм обучения, но при этом он не используется. Думаю, правильным решением будет
назначить нейрону случайные веса (как это и делается в обычных нейронных сетях) и уже корректировать нейрон,
обучая его на всех доступных файлах;
* Слова в документе, находящиеся рядом, имеют более тесную связь. Можно эти связи как-то учитывать (называется _биграмма_);
* __Контекст__. Диплом называется: "Классификация документов с использованием контекста". Так что нужно подумать, как его сюда прикрутить.

_Дополнительно_:
* сделать нормальное цветное логгирование событий
* запустить паука по РИНЦ, поскачивать документы и классифицировать их по УДК (но это когда будет ну сооовсем нечем себя занять)
* продумать возможность сохранения данных нейронов

## Этап 2. Улучшение словаря

[очень полезная ссылка](https://habrahabr.ru/post/332078/)

У текущей реализации словаря есть гиганстская проблема – он содержит в себе мусорные слова. Что это значит?
Возьмем, например, начало текста из документа выборки:

```
Xref: cantaloupe.srv.cs.cmu.edu alt.atheism:49960 alt.atheism.moderated:713 news.answers:7054 alt.answers:126
Path: cantaloupe.srv.cs.cmu.edu!crabapple.srv.cs.cmu.edu!bb3.andrew.cmu.edu!news.sei.cmu.edu!cis.ohio-state.edu!magnus.acs.ohio-state.edu!usenet.ins.cwru.edu!agate!spool.mu.edu!uunet!pipex!ibmpcug!mantis!mathew
From: mathew <mathew@mantis.co.uk>
Newsgroups: alt.atheism,alt.atheism.moderated,news.answers,alt.answers
```

Это заголовки письма. Конечно же, любой формат содержит в себе некие описанные определенным образом данные,
и в классификаторе при парсинге документа можно их просто проигнорировать.

Рассмотрим, что сделает текущая реализация парсинга
```js
text.trim().split(/[ \n\r,.:/"'+-=<>?!()*$_#`%&\t[\]{}\\^|~]+/g);
```
с такой строчкой:
```
cantaloupe.srv.cs.cmu.edu => [cantaloupe, srv, cs, cmu, edu]
```
То есть текущая реализация разобъет эту очевидно лишнюю для классификатора строчку на аж
целых 5 слов! и добавит в словарь. Такое загрязнение и проводит с таким низким
показателям алгоритма и раздутому (100'000 слов) словарю. Нужно не разбивать слова
бездумно по символам, а оставить разбиение по пробелам, и удалять те, что
имеют большое кол-во знаков внутри себя.

Однако, нужно реализовать это аккуратно, чтобы не нарушить _семантически верный_ парсинг текста.
То есть строчку `привет,мир` нужно разбить на слова `привет, мир`, а строчку
`dmitriy.penetrator@gmail.com` удалить полностью, не разбивая по символам.

**Решение**:

Решил разбить разделяющие символы на 2 группы: те, что всегда разбивают строку на слова:
` \n\r\t,/|\+–=<>()[]{}` и те, что могут находится только на конце слова:
`_.:-?!"'~#;*`. Первые из них использует `Reader` при разбиении строк, второй
– зона ответственности `transformers`, они удаляются только по краям.

_Почему выбраны именно такие символы?_ Символы выбраны так из двух причин:
1) Человек, набравший текст, мог по ошибке не поставить пробел между словами,
но удалять из словаря 2 слова из-за этого не хочется, поэтому я предугадал
эти ошибки, так напирмер фразу `привет,как дела` или `Дима+Таня=любовь` можно
написать без пробелов, а вот ошибку типа `hello"world"` человек вряд ли пропустит.
2) Специальные слова. _Почему `.!?` не входят в символы первой группы?_
Ответ на этот вопрос дает пример, приведенный выше:
`cantaloupe.srv.cs.cmu.edu!crabapple.srv.cs.cmu.edu`, `mathew@mantis.co.uk`.
Шанс, что эти символы являются частью специальных конструций гораздо выше, чем то,
что человек забыл поставить пробел. Да и если в словарь не попадут слова из
`Привет!Как дела?` будет лучше, чем если в словаре окажутся
`cantaloupe srv cs cmu edu`.
3) Также во вторую группу были включены `~#*` и подобные символы. Это задел на будущее.
Например, если в выборке окажутся тексты с языками разметки или программирования.

-------------------------------------

После нововведений размер словаря возвос до `120'000`! Однако, это совсем не плохо.
Даже наоборот, хорошо. Разница означает, что как минимум `20'000` слов в словаре мусорных!
Зато теперь слова `cantaloupe.srv.cs.cmu.edu`, `p?#$a.0rq'&`, `j;^i` четко видны в словаре, а значит пришла пора
вводить новый фильтр, который будет их убирать.

-------------------------------------

Добавил фильтр английских слов: `/^[A-Za-z]([-_'&]?[A-Za-z])*$/`. Количество
слов в словаре, правда, снова уменьшилось до 100'000, однако ожидается, что при этом
качество классификации возрастет. Тем не менее, это означает, что все-таки
необходимо сокращать редко встречающиеся слова в словаре.

К сожалению, качество классификации даже немного упало (точную статистику пока не
веду, процентов примерно на 15), но первые плоды уже есть – скорость классификации
сократилась на 80 секунд.

<img src="https://i.imgur.com/1C3v5sg.png" width=400/>

_В планах_: когда появится конфиг, сделать опцию выбора языка, чтобы пользователь
мог передать кастомную функцию или regex.

-------------------------------------

Добавил возможность фильтровать слова в словаре. Теперь те слова, что встретились
всего 1 раз отбрасываются. Это позволило сократить размер словаря на треть и
соответственно уменьшило на треть время работы. Также качество классификации
возросло на примерно на 4%. Однако, такой фильтрации сейчас явно недостаточно.
Нужно поэкспериментировать и добавить новые фильтры (благо функционал для этого уже подготовлен).

-------------------------------------

Если сейчас заглянуть в словарь, можно увидеть следующую картину:

```
the (209130)
to (104515)
of (98839)
and (83411)
in (69631)
```

Самые часто встречающиеся слова, конечно же, предлоги. Они, как правило,
тоже негативно влияют на качество классификации, уменьшая значимость
действительно ключевых слов текста. Однако, убирать нужно без фанатизма,
поэтому я отфильтровал только те слова, что как мне кажется, встречаются
везде и не влияют на стиль (в будущем хорошо было бы автоматизировать этот процесс):
`a the an | this that there | and or | is to be are was were | it | in on at | for of`.

Еще лучше решение: учитывать все предлоги, но с маленьким весом.

В результате, качество классификации возросло аж на 10%!!!

<img src="https://i.imgur.com/V2oKTkx.png" width=400/>

Убрав около еще 20ти самых популярных слов качество возросло еще на 10%.
Это означает, что они своими весами попросту мешают классификации.

Однако, цель моей дипломной работы – создание универсального классификатора для
всех языков, нужно придумать способ обойти указание предлогов лично.
Одно из предполагаемых решений я написал выше.

-------------------------------------

Стал учитывать количество слов при построении маски. Качество классификации в среднем возросло
на 5%, однако, это может быть просто совпадением.

-------------------------------------

Теперь официально известно, что существует 2 типа фильтров,
первый `ReaderFilter`, он на вход получает _слово_, применяется на этапе, когда
слова из документа уже получены и отредактированы. Второй тип фильтров:
`DictionaryFilter`, применяется на уже готовом общем для всей тестовой выборке.
На вход таким фильтрам подается _слово_ и _количество встречаний этого слова_.

Нужно будет в дальнейшем обдумать, может, вовсе стоит перейти на `DictionaryFilter`
и избавится от `DecorateReader`.

Теперь при построении общего словаря дополнительно строятся словари для
каждого класса документов обучающей выборки. Те слова, что входят в каждый
класс, удаляются из общего словаря (также возможный интерфейс взаимодействия для пользовательских
фильтров). Этот подход позволил избавится от слов, сбивающих и усредняющих классификацию.
Также позволил избавится от необходимости пользовательского фильтра для удаления частых
незначащих слов языка.

В итоге имеем классификатор, улучший свои показатели на аж 25%!!!

<img src="https://i.imgur.com/YHgZ9wr.png" width=400/>

Однако в словаре на первой строчке все же осталось слово
```
ax (32272)
```
Возможно, это знак, что стоит удалять слово, если оно находится в каком-то
большом проценте словарей, а не во всех сразу.

-------------------------------------

Убрал подсчет слов в маске, уровень классификации возрос до 79%.
С чем это связано пока не ясно, нужно будет сделать в конфиге
опцию `shouldCountWordsInMask` по умолчанию `false`.

<img src="https://i.imgur.com/lrrUwhh.png" width=400/>

-------------------------------------

Объединим слова в общем словаре по количеству их встречаний и посмотрим
на отображение, которое строится следующим принципом:

```
количество встречаний => количество таких слов
8 => 1637
7 => 2028
6 => 2609
5 => 3411
4 => 4861
3 => 7470 – резкий скачок (выброс)
2 => 14907
1 => 39085
```

Видно, как с "уникальностью" слова растет их количество. Шанс, что такие
редкие слова попадутся далее по классификации мизерные. Однако, они занимают
место в словаре, чем увеличивают память и время работы, и отрицательно
влияют на качество классификации тех классов, к которым они принадлежат.

На основе этих данных я добавил новый фильтр в словарь по количеству встречаний слов.
Была идея сделать этот фильтр автоматизированным, чтобы он сам определял порог по
этому отображению, однако решил отложить эту идею в пользу того, чтобы пользователь
по этим данным сам определил, какие слова ему удалять.

Я пока выбрал пороговым значением 3. В словаре останутся слова, которые
встречаются 4 или более раз.

Это не увеличило показатель классификатора, однако, сократила словарь до
33000 слов и уменьшило общее время работы с 260 секунд до 180.

-------------------------------------

По поводу слов, которые удаляются из словаря, если они оказались в каждой
классифицируемой категории. Собрал статистику частоты встречания одинаковых
слов в словарях.

Статистика собрана, когда словарь уже отфильтрован, но вышеупомянутые слова
не удалены.

```
7160 5061 4554 3404 2385 1759 1449 1106 881 765 712 666 540 500 490 472 428 447 546 1453
```

7160 слов встречаются лишь в 1 категории, 5061 слово – в двух, ...,
1453 слова встречаются в каждой (их я удаляю). Внешних причин удалять слова,
которые встречаются во всех категориях, кроме одной, нет. График количества
слов плавный, только последнее число дало скачок, собственно, эти слова
и удалил.

Изменил фильтр, теперь дополнительно можно указывать количество
документов, в которых должно быть слово, чтобы его можно было удалить.
Однако, значение все равно оставил на 20ти.

Нужно в будущем сделать такой отчет частью статистики.

-------------------------------------

Добавил возможность обучения нейронов. Вермя работы значительно возросло
из-за памяти на обучение (приходится создавать отдельную маску на каждый
файл и использовать Pool, соответственно. Однако прироста в качестве классификации
не произошло, даже наоборот. + теперь еще нужно подбирать параметр коэффициента обучения
и выбор изначальных весов (одинаковые или нет),
что тоже добавляет свои затраты.

Возможно, стоит проходить по файлам 2 раза, как это делается в настоящих
нейронных сетях, и корректировать веса, но это пока задел на будущее.
На данный момент опция обучания недоступна, но код под нее готов.

-------------------------------------

Добавил параметр `recognitionThreshold`, чтобы не добавлять в положительные
результаты те документы, что не прошли порог классификации.

Был неприятно удивлен тем, что многие документы не проходят порог даже
10%!!! процентов. Нужно посмотреть свою предыдущую работу, включить
режим обучания или поменять тестовую быворку. А пока результаты
очень плохие. 93% документов не прошли порог.

<img src="https://i.imgur.com/ksBeXlh.png" width=500/>

Добавил учет количества слов. Количество нераспознаных значительно
уменьшилось с 93% до 28%.

<img src="https://i.imgur.com/OPHHOdt.png" width=500/>

Для порога в 20% уже 69% нераспознанных, тоже не годится.

С включенным обучением с порогом в 10% 25% нераспознанных. Результаты чуть лучше,
но картину не делают.

Нужен другой подход с выставлению порога классификации. Процент распознавания
каждого документа очень маленький:

```
1.84%, 5.63%, 0.36%, 7.55%, 6.51%, 11.93%, 2.66%, 5%, 3.5%, 0.66%, 1.27%, 1.51%, 4.54%, 1.62%, 0.77%, 0.22%, 1%, 0.54%, 0.94%, 1.35%
```

Можно было бы суммировать значения и брать как долю от общего количества. Но тогда
самый большой процент из 12 превратился бы в 20, что тоже особой погоды не делает.
Гораздо ценнее, насколько максимальное значение отличается от следующего.
В данном случае результат – 1.5 раза, что очень даже неплохо.

Пока вводить это значение в обиход не буду, отложу уже после того, как
доделаю конфигурационный файл и стеминг.

-------------------------------------

Включил стемминг (унисексацию) слов. Словарь уменьшился с 37872 до 26957 слов.

Однако, вопреки ожиданиям качество классификации снизилось на 3% до 76%.
Но отключать стемминг не буду, огрехи связанны с некой неправильной реализацией самого
обучения.

-------------------------------------

Если взсять на рассмотрение различные бибилиотеки на Java, то в них,
как правило, очень раздутый API. Конечному пользователю нужно держать
в голове огровное количество классов и их методов, и уметь в них не терятся.
И сделать это очень трудно. Такой принцип поставления библиотек имеет свои плюсы,
но у него есть очень весомый недостаток – такой подход расходится с желаниями
пользователя.

В программистской среде библиотеки были изобретены для того, чтобы обособить
все знания о каких либо действиях и предоставлять лишь средства управления.
Программисты, использующие библиотеки, заинтереснованы в том, чтобы как можно
быстрее и безболезненней их использовать и сконцентрироваться действительно на
важной для них задаче.

Но подход, где API представляет собой несколько классов со своин набором
методов заставляет программиста тратить время на разбор чужого кода, тем
самым значительно теряя в эффективности. И такой подход уже давно вызывает
отторжение. Потому что есть более приятная альтернатива. Ей мы и воспользуемся.

Классификатор будет иметь лишь одну точну входа, а сама декларация классификатора
будет напоминать конструктор. При чем при необходимости этот конструктор можно будет расширить
своими деталями. Такой модульный подход уже давно принят в среде npm.

Кажется, что такой подход нарушает принцип единой ответственности класса.
Однако, это не так. API – отдельный от всего кода набор входных точек,
он лишь вызывает цепочку методов скрытых от пользователя классов и выдает
ответ. Один метод вместо того, чтобы вызывать такую цепочку самостоятельно,
как это делается на Java.

Модульность библиотеки позволяет изменять шаги этой цепочки или перенаправлять при
необходимости, так что это компенсирует недостаток самостоятельности
при конструировании шагов. Вместо гигантской иерархии классов человек
получает набор методов одного класса и подробное описание, как конструировать
объект (обычно это описание объекта с параметрами) и какой ход выполнения (flow) имеет
каждый метод.

Нужно грамотно организовать flow алгоритма и документацию.

## Документация

Однако, все же обойтись одним объектом не получится. Кроме классификатора
нужно еще собирать тестовые выборки из данных. Поэтому было решено
разбить весь API на 2 части: подготовку данных `Dataset` и настройку
классификатора `Classifier`.

#### Dataset

`Dataset` является классом, представляющем всю учебную и тестовую выборку
одного классификатора.

<u>Конструктор</u>

`new Dataset()` – создает пустой набор тестовых данных

<u>Методы</u>

`addTrainingSet(category, trainingSet)`
- `{String} category` – название категории документа
- `{String[]} trainingSet` – список файлов
Пополняет тренировочную выборку указанной категории файлами. Если категории
в выборки еще нет, создает новую категорию. Если категория не строка или пустая
строка, завершится с ошибкой. Если список файлов не массив строк, завершится
с ошибкой.

`addTestSet(category, testSet)`
- `{String} category` – название категории документа
- `{String[]} testSet` – список файлов
Пополняет тестовую выборку указанной категории файлами. Если категории
в выборки еще нет, создает новую категорию. Если категория не строка или пустая
строка, завершится с ошибкой. Если список файлов не массив строк, завершится
с ошибкой.

`add(category, trainingSet, testSet)`
- `{String} category` – название категории документа
- `{String[]} trainingSet` – тренировочная выборка
- `{String[]} testSet` – тестовая выборка
Шорткат для методов `addTrainingSet` и `addTestSet`.

`{String[]} getTrainingSet(category)`
- `{String} category` – название категории
Вернет тренировочную выборку указанной категории или `null`, если категории
нет в наборе данных.

`{String[]} getTestSet(category)`
- `{String} category` – название категории
Вернет тестовую выборку указанной категории или `null`, если категории
нет в наборе данных.

`getter {String[]} categories`

Вернет список всех категорий.

`validate()`

Проверяет, содержит ли каждая категория хотя бы один тренировочный и однин
тестовый файл. Если нет, завершится с ошибкой.

<u>Статические методы</u>

Являются шорткатами для наиболее популярных действий с выборками.
Обратите внимание, функции являются асинхронными.

`static async {Dataset} createAndSplit(folders, rate)`
- `{String[]} folders` – список папок
- `{Number} rate` – число от 0 до 1 исключительно, доля тренировочных файлов в папках

Собирает `Dataset` на основе файлов в переданных папках. Названиями категорий
служат имена папок. В каждой папке файлы делятся на тренировочные и тестовые
в соотношении `rate : 1 - rate` соответственно. Если в папке меньше двух
файлов, завершится с ошибкой.

`static async {Dataset} createFromSplit(training, test)`
- `{String} training` – путь к тренировочной папке
- `{String} test` – путь к тестовой папке.

Собирает `Dataset` на основе папки тренировочными и тестовыми файлами.
Папки `training` и `test` должны содержать подпаки с файлами. Каждая такая подпапка –
название категории. В них должны лежать файлы, принадлежащие этой категории и выборке.

### Classifier

Класс, представляющий собой классификатор.

<u> Конструктор </u>

`new Classifier(dataset, config)`
- `{Dataset} dataset` – набор данных, должен быть валидным (см. `Dataset.prototype.validate`),
иначе завершится с ошибкой
- `{Object} config` – конфигурация.

Конфигурация представляет собой javascript-объект парметров классификатора следующего вида:

- `countWords: {Boolean}` – учитывать количество слов в маске при построении словаря. По-умолчанию `false`.
- `poolSize: {Number}` – ограничение оперативной памяти, используемой нейронами (напрямую влияет на скорость
обучения и классификации). Измеряется в байтах, значение по-умолчанию – `524'288'000` (500 Мб). Если хотя бы один
файл выборки будет оп размеру больше `poolSize`, классификатор завершится с ошибкой.
- `withLearning: {Boolean}` – включен ли алгоритм обучения. Если `false`, нейроны будут строится на одной маске,
собранной из всех документов обучающей выборки. Если `true`, нейроны будут инициализированы весами (см. `randomWeights`)
и обучаться на каждый документ (маску) тренировочной выборки. Путь обучения значительно длиннее и дороже по памяти, поэтому
по-умолчанию он выключен: `false`.
- `randomWeights: {Boolean}` – проставлять веса нейронам случайным образом. Иначе веса будут одинаковыми. Используется лишь
при включенном обучении (см. `withLearning`).
- `learningIterations: {Number}` – количество итераций (прогонов) алгоритма обучения. По-умолчанию: `1`.
Используется лишь при включенном обучении (см. `withLearning`).
- `learningRate: {Number}` – скорость обучения. Принимает значение в диапазоне `(0; 1]`. По-умолчанию: `0.1`. Используется лишь при включенном обучении (см. `withLearning`).
- `dictionaryFilters: {Object}` – свойства фильтров словаря (они довольно специфичные и задаются 2-мя свойствами):
  - `count: {Number}` – для фильтра редких слов. Слова, которые встречаются в словаре реже, чем `count` раз будут удалены. По-умолчанию: `1`.
  - `common: {Number}` – для фильтра часто встречающихся слов. Слова, которые встречаются `common` раз в словарях или чаще, будут удалены. По-умолчанию значение равно количеству словарей.
- `transformers: {Functions[]}` – трансформеры слов. Что такое трансформеры текста смотрите ниже.
По-умолчанию приводит слова в нижний регистр, удаляет лишние символы по краям слова и делает стемминг.
- `filters: {Functions[]}` – фильтры слов. Что такое фильтры слов смотрите ниже. По-умолчанию отфильтровывает словаря из одной буквы и не английские слова.

Немаловажно уделять внимание безопасности внешнего API. Если пользователь ввел некоорректные данные, он обязательно
об этом должен узнать, а не полагаться на полученные неверные данные программы. Поэтому файл конфигурации проходит
тщательную валидацию (тут рассказать как именно).

Внимание! Файл конфигурации на этапе создания классификатора проходит валидацию, и если какие-то поля не прошли валидацию типов
или обнаружено лишнее поле программа завершится с ошибкой. Объект конфигурации по-умолчанию выглядит следующим образом:

```javascript
{
    countWords: false,
    poolSize: 524288000,
    withLearning: false,
    randomWeights: false,
    learningIterations: 1,
    learningRate: 0.1,
    dictionaryFilters: {
        count: 1,
        common: <длина словаря>
    },
    transformers: [TO_LOWER_CASE, TRIM, STEM],
    filters: [NO_LETTERS, ENGLISH]
}
```

#### Трансформеры

После прочтением слова (токена) из текста, его нужно обработать и отобрать валидные и важные для классификатора.
За обработку отвечают трансформеры. Трансформеры – массив функций, которые на вход получают слово и возвращают измененное слово,
и отрабатывают по порядку указания в массиве.

По-умолчанию доспупны следующие трансформеры:
- `TO_LOWER_CASE` – преобразует слова в нижний регистр
- `TRIM` – удаляет лишние символы `_.:-?!"'~#;*^` по краям слова
- `STEM` – стемминг (унисексация)

Но никто не мешает передать в конфигурационный файл свои трансформеры:

```javascript
(word) => {
    // ... код ...
    return transformedWord;
}
```

Трансформеры доступны из `Classifier.TRANSFORMERS`.

#### Фильтры

После того, как слово прошло все трансформеры, чтобы оно попало в словарь,
оно должно пройти все фильтры. Фильтр – функция, которая на вход получает
слово, а возвращает `true` или `false`. Если хотя бы один фильтр не провалидировал слово (вернул `false`),
слово в словарь не попадает.

По-умолчанию доспупны следующие фильтры:
- `NO_LETTERS` – отфильтровывает все буквы
- `ENGLISH` – отфильтровывает все не английские слова (на самом деле за ним скрывается обычный RegExp
`/^[A-Za-z]([-_'&]?[A-Za-z])*$/`.

Фильтры доступны из `Classifier.FILTERS`

Список фильтров и трансформеров будет пополняться по мере доказания их эффективности.

<u>Методы</u>

пока до конца не обдуманы
